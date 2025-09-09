import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  addRatingModel,
  filterRatingsModel,
  updateRatingModel,
} from "../models/rating.model";
import { RatingService } from "../services/rating.service";
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
      ratingService: DiContainer.get(SatisticsService),
    }))
    .post(
      "get-summary-satistics",
      ({ ratingService, body }) => ratingService.getSummarySatistics(body),
      {
        body: getSatisticsModel,
      },
    )
    .post(
      "get-detailed-satistics",
      ({ ratingService, body }) => ratingService.getDetailedSatistics(body),
      {
        body: getSatisticsModel,
      },
    ),
);
