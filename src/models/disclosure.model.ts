import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import {
  disclosureConsultations,
  disclosureDetails,
  disclosureNotes,
  disclosures,
} from "../db/schema";
import { t } from "elysia";
import { paginationModel } from "./common.model";

export const disclosureInsertModel = createInsertSchema(disclosures);

export const disclosureSelectModel = createSelectSchema(disclosures);

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
  "archivedAt",
  "archivedBy",
  "archivedReason",
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
    "type",
    "createdBy",
    "customRating",
    "details",
    "initialNote",
    "ratingNote",
    "updatedBy",
    "visitNote",
    "visitReason",
    "visitResult",
    "ratingId",
  ]),
  t.Partial(
    t.Object({
      // patientIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
      scoutIds: t.Array(t.String({ format: "uuid" })),

      patientId: t.String({ format: "uuid" }),

      priorityIds: t.Array(t.String({ format: "uuid" })),

      ratingIds: t.Array(t.String({ format: "uuid" })),

      createdAtStart: t.String({ format: "date-time" }),

      createdAtEnd: t.String({ format: "date-time" }),

      status: t.Array(disclosureInsertModel.properties.status),

      type: t.Array(disclosureInsertModel.properties.type),

      visitResult: t.Array(disclosureInsertModel.properties.visitResult),

      undelivered: t.Boolean(),

      unvisited: t.Boolean(),

      unrated: t.Boolean(),

      isCustomRating: t.Boolean(),

      isReceived: t.Boolean(),
    }),
  ),
]);

// export const updateVisitModel = t.Composite([
//   t.Pick(disclosureSelectModel, ["id"]),
//   t.Object({
//     visitResult: t.Optional(disclosureSelectModel.properties.visitResult),
//     visitReason: t.Optional(disclosureSelectModel.properties.visitReason),
//     visitNote: t.Optional(disclosureSelectModel.properties.visitNote),
//   }),
// ]);

// NOTES
export const disclosureNoteSelectModel = createSelectSchema(disclosureNotes);

export const disclosureNoteInsertModel = createInsertSchema(disclosureNotes);

export const addDisclosureNoteModel = t.Composite([
  t.Omit(disclosureNoteInsertModel, [
    "id",
    "createdAt",
    "createdBy",
    "updatedAt",
    "noteAudio",
  ]),
  t.Partial(
    t.Object({
      audioFile: t.File(),
    }),
  ),
]);
export const updateDisclosureNoteModel = t.Composite([
  t.Pick(disclosureNoteSelectModel, ["id"]),
  addDisclosureNoteModel,
  t.Partial(
    t.Object({
      deleteAudioFile: t.String(),
    }),
  ),
]);

export const getDisclosureNotesModel = t.Composite([
  paginationModel,
  t.Pick(disclosureNoteInsertModel, ["disclosureId"]),
  t.Object({ query: t.Optional(t.String()) }),
]);

// CONSULTATIONS
export const disclosureConsultationInsertModel = createInsertSchema(
  disclosureConsultations,
);

export const disclosureConsultationSelectModel = createSelectSchema(
  disclosureConsultations,
);

export const addDisclosureConsultationModel = t.Composite([
  t.Omit(disclosureConsultationInsertModel, [
    "id",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
    "consultationAudio",
  ]),
  t.Partial(
    t.Object({
      consultationAudioFile: t.File(),
    }),
  ),
]);

export const updateDisclosureConsultationModel = t.Composite([
  t.Required(t.Pick(disclosureConsultationSelectModel, ["id"])),
  t.Omit(addDisclosureConsultationModel, ["id"]),
  t.Partial(
    t.Object({
      deleteAudioFile: t.String(),
    }),
  ),
]);

export const completeDisclosureConsultationModel = t.Composite([
  t.Required(t.Pick(disclosureConsultationSelectModel, ["id"])),
  t.Object({
    ratingId: t.Optional(t.String({ format: "uuid" })),
    isCustomRating: t.Optional(t.Boolean()),
    customRating: t.Optional(t.String()),
    ratingNote: t.Optional(t.String()),
  }),
]);

export const getDisclosureConsultationsModel = t.Composite([
  paginationModel,
  t.Partial(
    t.Object({
      consultationStatus:
        disclosureConsultationInsertModel.properties.consultationStatus,
      consultedBy: t.String({ format: "uuid" }),
      createdBy: t.String({ format: "uuid" }),
      createdAtStart: t.String({ format: "date-time" }),
      createdAtEnd: t.String({ format: "date-time" }),
      disclosureId: t.String({ format: "uuid" }),
    }),
  ),
]);

// AUDIT LOG

export const getDisclosureAuditLogsModel = t.Composite([
  paginationModel,
  t.Pick(disclosureNoteInsertModel, ["disclosureId"]),
]);

export const moveDisclosuresModel = t.Object({
  fromScoutId: t.String({ format: "uuid" }),
  toScoutId: t.String({ format: "uuid" }),
});

export const getDisclosureAppointmentsModel = t.Object({
  fromDate: t.String({ format: "date" }),
  toDate: t.String({ format: "date" }),
  scoutId: t.Optional(t.String({ format: "uuid" })),
  uncompletedOnly: t.Optional(t.Boolean()),
});

export const getDateAppointmentsModel = t.Composite([
  paginationModel,
  t.Omit(getDisclosureAppointmentsModel, ["fromDate", "toDate"]),
  t.Object({
    date: t.String({ format: "date" }),
  }),
]);

export const disclosureDetailsInsertModel =
  createInsertSchema(disclosureDetails);

export const disclosureDetailsSelectModel =
  createSelectSchema(disclosureDetails);

export const getDisclosureDetailsModel = t.Pick(disclosureDetailsSelectModel, [
  "disclosureId",
]);

// ARCHIVE
export const archiveDisclosureModel = t.Pick(disclosureSelectModel, ["id"]);
