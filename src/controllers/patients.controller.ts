import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addPatientModel,
  patientSelectModel,
  filterPatientsModel,
  updatePatientModel,
} from "../models/patient.model";
import { PatientService } from "../services/patient.service";

export const PatientsController = new Elysia({
  name: "Patients.Controller",
  tags: ["Patients"],
}).group("/patients", (app) =>
  app
    .resolve(() => ({ patientService: DiContainer.get(PatientService) }))
    .post(
      "search",
      ({ body, patientService }) => patientService.searchPatients(body),
      {
        body: filterPatientsModel,
      },
    )
    .get(
      ":id",
      ({ params, patientService }) => patientService.getPatientById(params.id),
      {
        params: t.Pick(patientSelectModel, ["id"]),
      },
    )

    .post("", ({ body, patientService }) => patientService.addPatient(body), {
      body: addPatientModel,
    })
    .put("", ({ body, patientService }) => patientService.updatePatient(body), {
      body: updatePatientModel,
    }),
);
