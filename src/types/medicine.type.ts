import { Static } from "elysia";
import {
  addMedicineModel,
  addPatientMedicineModel,
  filterMedicinesModel,
  filterPatientMedicinesModel,
  medicineSelectModel,
  patientMedicineSelectModel,
  updateMedicineModel,
  updatePatientMedicineModel,
} from "../models/medicine.model";
import { TCreatedBy, TUpdatedBy } from "./common.types";

export type TFilterMedicinesDto = Static<typeof filterMedicinesModel>;

export type TMedicine = Static<typeof medicineSelectModel>;

export type TAddMedicineDto = Static<typeof addMedicineModel>;

export type TUpdateMedicineDto = Static<typeof updateMedicineModel>;

export type TPatientMedicine = Static<typeof patientMedicineSelectModel> & {
  medicine: TMedicine;
};

//

export type TFilterPatientMedicinesDto = Static<
  typeof filterPatientMedicinesModel
>;

export type TAddPatientMedicineDto = Static<typeof addPatientMedicineModel> &
  TCreatedBy;

export type TUpdatePatientMedicineDto = Static<
  typeof updatePatientMedicineModel
> &
  TUpdatedBy;
