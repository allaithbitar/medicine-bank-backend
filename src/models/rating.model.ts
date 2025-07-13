import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { ratings } from "../db/schema";

export const ratingInsertModel = createInsertSchema(ratings);

export const ratingSelectModel = createSelectSchema(ratings);

export const addRatingModel = t.Omit(ratingInsertModel, ["id"]);

export const updateRatingModel = t.Composite([
  t.Pick(ratingSelectModel, ["id"]),
  addRatingModel,
]);

export const filterRatingsModel = t.Partial(t.Omit(ratingInsertModel, ["id"]));
