import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { addPatientModel, updatePatientModel } from "../models/patient.model";
import { PatientService } from "../services/patient.service";

export const PatientsController = new Elysia({
  name: "Patients.Controller",
  tags: ["Patients"],
}).group("/patients", (app) =>
  app
    .resolve(() => ({ patientService: DiContainer.get(PatientService) }))
    .post("", ({ body, patientService }) => patientService.addPatient(body), {
      body: addPatientModel,
    })
    .put("", ({ body, patientService }) => patientService.updatePatient(body), {
      body: updatePatientModel,
    }),
);
