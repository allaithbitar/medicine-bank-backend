import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { TDbContext } from "../db/drizzle";
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
    .put(
      "",
      () => {
        const db = DiContainer.get("db") as TDbContext;
        return db.query.employees.findMany({
          with: {
            area: true,
          },
        });
      },
      {
        body: updatePatientModel,
      },
    ),
);
