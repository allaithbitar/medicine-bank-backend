import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import {
  disclosureConsultations,
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
  ]),
  t.Object({
    // patientIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
    scoutIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),

    patientId: t.Optional(t.String({ format: "uuid" })),

    

    priorityIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { default: [] }),
    ),

    createdAtStart: t.Optional(t.String({ format: "date-time" })),

    createdAtEnd: t.Optional(t.String({ format: "date-time" })),

    status: t.Optional(
      t.Array(disclosureInsertModel.properties.status, { default: [] }),
    ),
    type: t.Optional(
      t.Array(disclosureInsertModel.properties.type, { default: [] }),
    ),

    undelivered: t.Optional(t.Boolean()),
  }),
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
  t.Object({
    consultationStatus: t.Optional(
      disclosureConsultationInsertModel.properties.consultationStatus,
    ),
    consultedBy: t.Optional(t.String({ format: "uuid" })),
    createdBy: t.Optional(t.String({ format: "uuid" })),
    createdAtStart: t.Optional(t.String({ format: "date-time" })),
    createdAtEnd: t.Optional(t.String({ format: "date-time" })),
    disclosureId: t.Optional(t.String({ format: "date-time" })),
  }),
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
