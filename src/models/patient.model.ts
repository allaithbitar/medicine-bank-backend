import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { patients } from "../db/schema";
import { paginationModel } from "./common.model";

export const patientSelectModel = createSelectSchema(patients);

export const patientInsertModel = createInsertSchema(patients);

export const addPatientModel = t.Composite([
  t.Omit(patientInsertModel, ["createdAt", "updatedAt", "id"]),
  t.Object({
    phoneNumbers: t.Array(t.String(), { default: [], minItems: 1 }),
  }),
]);

export const updatePatientModel = t.Composite([
  t.Pick(patientSelectModel, ["id"]),
  addPatientModel,
]);

export const filterPatientsModel = t.Composite([
  paginationModel,
  t.Object({
    query: t.Optional(t.String()),
    areaIds: t.Optional(t.Array(t.String({ format: "uuid" }), { default: [] })),
  }),
]);
