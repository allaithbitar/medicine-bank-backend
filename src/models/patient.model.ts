import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { patients } from "../db/schema";
import { paginationModel } from "./common.model";

export const patientSelectModel = createSelectSchema(patients);

export const patientInsertModel = createInsertSchema(patients);

export const addPatientModel = t.Composite([
  t.Omit(patientInsertModel, [
    "createdAt",
    "updatedAt",
    "id",
    "createdBy",
    "updatedBy",
  ]),
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
  t.Partial(t.Omit(addPatientModel, ["phoneNumbers", "areaId"])),
  t.Partial(
    t.Object({
      phone: t.String(),
      areaIds: t.Array(t.String({ format: "uuid" })),
    }),
  ),
]);

export const validatePatientNationalNumberModel = t.Object({
  patientId: t.Optional(t.String()),
  nationalNumber: t.String({ minLength: 11, maxLength: 11 }),
});

export const validatePatientPhoneNumbers = t.Object({
  patientId: t.Optional(t.String()),
  phoneNumbers: t.Array(t.String()),
});
