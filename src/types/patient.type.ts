import { InferSelectModel } from "drizzle-orm";
import { patients, patientsPhoneNumbers } from "../db/schema";
import { Static } from "elysia";
import { addPatientModel, updatePatientModel } from "../models/patient.model";

export type TPatient = InferSelectModel<typeof patients>;

export type TAddPatientDto = Static<typeof addPatientModel>;

export type TUpdatePatientDto = Static<typeof updatePatientModel>;

export type TPatientPhoneNumber = InferSelectModel<typeof patientsPhoneNumbers>;
