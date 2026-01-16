import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addRatingModel,
  filterRatingsModel,
  ratingSelectModel,
  updateRatingModel,
} from "../models/rating.model";
import { RatingService } from "../services/rating.service";
import { AuthGuard } from "../guards/auth.guard";

export const RatingsController = new Elysia({
  name: "Ratings.Controller",
  tags: ["Ratings"],
}).group("/ratings", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      ratingService: DiContainer.get(RatingService),
    }))
    .get("", ({ ratingService, query }) => ratingService.getRatings(query), {
      query: filterRatingsModel,
    })
    .get(
      ":id",
      ({ ratingService, params }) => ratingService.getRating(params.id),
      {
        params: t.Pick(ratingSelectModel, ["id"]),
      },
    )

    .post(
      "",
      async ({ ratingService, body }) => ratingService.addRating(body),
      {
        body: addRatingModel,
        roles: ["manager"],
      },
    )
    .put(
      "",
      async ({ ratingService, body }) => ratingService.updateRating(body),
      {
        body: updateRatingModel,
        roles: ["manager"],
      },
    ),
);
