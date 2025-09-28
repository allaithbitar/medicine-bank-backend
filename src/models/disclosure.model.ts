import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import {
  disclosureNotes,
  disclosures,
  disclosuresToRatings,
  visits,
} from "../db/schema";
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
  "createdBy",
  "updatedBy",
  "finishedAt",
  "finishedBy",
  "canceledAt",
  "canceledBy",
]);

export const updateDisclosureModel = t.Composite([
  t.Pick(disclosureSelectModel, ["id"]),
  t.Partial(addDisclosureModel),
]);

export const updateDisclosureStatusModel = t.Composite([
  t.Pick(disclosureSelectModel, ["id"]),
]);

export const searchDisclosuresModel = t.Composite([
  paginationModel,
  t.Omit(disclosureInsertModel, [
    "id",
    "priorityId",
    "patientId",
    "updatedAt",
    "scoutId",
    "createdAt",
    "status",
  ]),
  t.Object({
    // patientIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
    scoutIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),

    patientId: t.Optional(t.String({ format: "uuid" })),

    ratingIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),

    priorityIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),

    createdAtStart: t.Optional(t.String({ format: "date-time" })),

    createdAtEnd: t.Optional(t.String({ format: "date-time" })),

    status: t.Optional(
      t.Array(disclosureInsertModel.properties.status, { default: [] }),
    ),

    undelivered: t.Optional(t.Boolean()),
  }),
]);

export const addDisclosureRatingModel = t.Omit(ratingToDisclosureInsertModel, [
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updateDisclosureRatingModel = t.Composite([
  t.Required(t.Pick(ratingToDisclosureInsertModel, ["id"])),

  t.Omit(addDisclosureRatingModel, ["id"]),
]);

export const getDisclosureRatingsModel = t.Composite([
  paginationModel,
  t.Pick(ratingToDisclosureInsertModel, ["disclosureId", "isCustom"]),
]);

export const visitSelectModel = createSelectSchema(visits);

export const visitInsertModel = createInsertSchema(visits);

export const addDisclosureVisitModel = t.Omit(visitInsertModel, [
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updateDisclosureVisitModel = t.Composite([
  t.Pick(visitSelectModel, ["id"]),
  t.Omit(visitInsertModel, [
    "id",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ]),
]);

export const getDisclosureVisitsModel = t.Composite([
  paginationModel,
  t.Omit(visitInsertModel, [
    "id",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
    "reason",
    "note",
  ]),
]);

// NOTES
export const disclosureNoteSelectModel = createSelectSchema(disclosureNotes);

export const disclosureNoteInsertModel = createInsertSchema(disclosureNotes, {
  note: t.String({ minLength: 10 }),
});

export const addDisclosureNoteModel = t.Omit(disclosureNoteInsertModel, [
  "id",
  "createdAt",
  "createdBy",
  "updatedAt",
]);

export const updateDisclosureNoteModel = t.Composite([
  t.Pick(disclosureNoteSelectModel, ["id"]),
  addDisclosureNoteModel,
]);

export const getDisclosureNotesModel = t.Composite([
  paginationModel,
  t.Pick(disclosureNoteInsertModel, ["disclosureId"]),
  t.Object({ query: t.Optional(t.String()) }),
]);

// AUDIT LOG

export const getDisclosureAuditLogsModel = t.Composite([
  paginationModel,
  t.Pick(disclosureNoteInsertModel, ["disclosureId"]),
]);
