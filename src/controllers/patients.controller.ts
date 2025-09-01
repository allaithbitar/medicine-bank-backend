import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addPatientModel,
  patientSelectModel,
  filterPatientsModel,
  updatePatientModel,
} from "../models/patient.model";
import { PatientService } from "../services/patient.service";
import { AuthGuard } from "../guards/auth.guard";

export const PatientsController = new Elysia({
  name: "Patients.Controller",
  tags: ["Patients"],
}).group("/patients", (app) =>
  app
    .use(AuthGuard)
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
    .post(
      "",
      ({ body, patientService, user }) =>
        patientService.addPatient({ ...body, createdBy: user.id }),
      {
        body: addPatientModel,
        roles: ["manager", "supervisor"],
      },
    )
    .put(
      "",
      ({ body, patientService, user }) =>
        patientService.updatePatient({ ...body, updatedBy: user.id }),
      {
        body: updatePatientModel,
        roles: ["manager", "supervisor"],
      },
    ),
);
