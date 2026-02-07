import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { paginationModel } from "./common.model";
import { medicines, patientMedicines } from "../db/schema";

export const medicineInsertModel = createInsertSchema(medicines, {
  doseVariants: t.Optional(
    t.Array(t.Number(), {
      examples: [[100, 500]],
    }),
  ),
});

export const medicineSelectModel = createSelectSchema(medicines);

export const addMedicineModel = t.Omit(medicineInsertModel, ["id"]);

export const updateMedicineModel = t.Composite([
  t.Pick(medicineSelectModel, ["id"]),
  t.Partial(addMedicineModel),
]);

export const filterMedicinesModel = t.Composite([
  paginationModel,
  t.Partial(t.Pick(medicineInsertModel, ["form", "name"])),
]);

// export const deleteFamilyMemberModel = t.Composite([
//   t.Required(t.Pick(familyMemberInsertModel, ["id"])),
//   t.Required(t.Pick(familyMemberInsertModel, ["patientId"])),
// ]);
//

export const patientMedicineSelectModel = createSelectSchema(patientMedicines);

export const patientMedicineInsetModel = createInsertSchema(patientMedicines, {
  dosePerIntake: t.Optional(t.Number()),
});

export const addPatientMedicineModel = t.Omit(patientMedicineInsetModel, [
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updatePatientMedicineModel = t.Composite([
  addPatientMedicineModel,
  t.Pick(patientMedicineSelectModel, ["id"]),
]);

export const filterPatientMedicinesModel = t.Composite([
  filterMedicinesModel,
  t.Pick(addPatientMedicineModel, ["patientId"]),
]);
