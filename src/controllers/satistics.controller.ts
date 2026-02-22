import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { AuthGuard } from "../guards/auth.guard";
import { SatisticsService } from "../services/satistics.service";
import { getSatisticsModel } from "../models/satistics.model";

export const SatisticsController = new Elysia({
  name: "Satistics.Controller",
  tags: ["Satistics"],
}).group("/satistics", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      satisticsService: DiContainer.get(SatisticsService),
    }))
    .post(
      "get-summary-satistics",
      ({ satisticsService, body }) =>
        satisticsService.getSummarySatistics(body),
      {
        body: getSatisticsModel,
      },
    )
    .post(
      "get-half-detailed-satistics",
      async ({ satisticsService, body }) => {
        const [
          addedDisclosures,
          uncompletedVisits,
          completedVisits,
          cantBeCompletedVisits,
          lateDisclosures,
        ] = await Promise.all([
          satisticsService.getAddedDisclosuresSummary(body),
          satisticsService.getUncompletedVisitsSummary(body),
          satisticsService.getCompletedVisitsSummary(body),
          satisticsService.getCantBeCompletedVisitsSummary(body),
          satisticsService.getLateDisclosuresSummary(body),
        ]);

        return {
          addedDisclosures,
          uncompletedVisits,
          completedVisits,
          cantBeCompletedVisits,
          lateDisclosures,
        };
      },
      {
        body: getSatisticsModel,
      },
    )

    .post(
      "get-detailed-satistics",
      ({ satisticsService, body }) =>
        satisticsService.getDetailedSatistics(body),
      {
        body: getSatisticsModel,
      },
    ),
);
