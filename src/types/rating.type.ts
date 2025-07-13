import { Static } from "elysia";
import {
  addRatingModel,
  filterRatingsModel,
  ratingSelectModel,
  updateRatingModel,
} from "../models/rating.model";

export type TRating = Static<typeof ratingSelectModel>;

export type TAddRatingDto = Static<typeof addRatingModel>;

export type TUpdateRatingDto = Static<typeof updateRatingModel>;

export type TFilterRatingsDto = Static<typeof filterRatingsModel>;
