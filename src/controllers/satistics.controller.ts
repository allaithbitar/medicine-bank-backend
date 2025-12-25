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
      "get-detailed-satistics",
      ({ satisticsService, body }) =>
        satisticsService.getDetailedSatistics(body),
      {
        body: getSatisticsModel,
      },
    ),
);
