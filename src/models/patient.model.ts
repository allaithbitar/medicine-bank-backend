import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { patients } from "../db/schema";

export const patientSelectModel = createSelectSchema(patients);

export const patientInsertModel = createInsertSchema(patients);

export const addPatientModel = t.Composite([
  t.Omit(patientInsertModel, ["createdAt", "updatedAt", "id"]),
  t.Object({
    phoneNumbers: t.Optional(t.Array(t.String(), { default: [] })),
  }),
]);
export const updatePatientModel = t.Composite([
  t.Pick(patientSelectModel, ["id"]),
  addPatientModel,
]);
