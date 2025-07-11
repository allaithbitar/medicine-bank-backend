import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { disclosures, disclosuresToRatings } from "../db/schema";
import { t } from "elysia";
import { paginationModel } from "./common.model";

export const disclosureInsertModel = createInsertSchema(disclosures);

export const disclosureSelectModel = createSelectSchema(disclosures);

export const ratingToDisclosureInsertModel =
  createInsertSchema(disclosuresToRatings);

export const addDisclosureModel = t.Omit(disclosureInsertModel, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const updateDisclosureModel = t.Composite([
  t.Pick(disclosureSelectModel, ["id"]),
  addDisclosureModel,
]);

export const searchDisclosuresModel = t.Composite([
  paginationModel,
  t.Omit(disclosureInsertModel, [
    "id",
    "priortyId",
    "patientId",
    "updatedAt",
    "employeeId",
    "createdAt",
  ]),
  t.Object({
    // patientIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
    employeeIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),
    ratingIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),
    createdAtStart: t.Optional(t.String({ format: "date-time" })),
    createdAtEnd: t.Optional(t.String({ format: "date-time" })),
  }),
]);

export const addDisclosureRatingModel = t.Omit(ratingToDisclosureInsertModel, [
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updateDisclosureRatingModel = t.Composite([
  t.Required(t.Pick(ratingToDisclosureInsertModel, ["id"])),

  t.Omit(addDisclosureRatingModel, ["id"]),
]);
