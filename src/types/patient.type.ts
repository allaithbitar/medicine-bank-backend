import { InferSelectModel } from "drizzle-orm";
import { patients, patientsPhoneNumbers } from "../db/schema";
import { Static } from "elysia";
import {
  addPatientModel,
  filterPatientsModel,
  updatePatientModel,
  validatePatientNationalNumberModel,
  validatePatientPhoneNumbers,
} from "../models/patient.model";
import { TCreatedBy, TUpdatedBy } from "./common.types";

export type TPatient = InferSelectModel<typeof patients>;

export type TAddPatientDto = Static<typeof addPatientModel> & TCreatedBy;

export type TUpdatePatientDto = Static<typeof updatePatientModel> & TUpdatedBy;

export type TPatientPhoneNumber = InferSelectModel<typeof patientsPhoneNumbers>;

export type TFilterPatientsDto = Static<typeof filterPatientsModel>;

export type TValidatePatientNationalNumberDto = Static<
  typeof validatePatientNationalNumberModel
>;

export type TValidatePatientPhoneNumbersDto = Static<
  typeof validatePatientPhoneNumbers
>;
