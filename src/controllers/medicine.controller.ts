import Elysia from "elysia";
import DiContainer from "../di/di-container";
import {
  addMedicineModel,
  addPatientMedicineModel,
  filterMedicinesModel,
  filterPatientMedicinesModel,
  updateMedicineModel,
  updatePatientMedicineModel,
} from "../models/medicine.model";
import { MedicineService } from "../services/medicine.service";
import { AuthGuard } from "../guards/auth.guard";

export const MedicinesController = new Elysia({
  name: "Medicines.Controller",
  tags: ["Medicines"],
}).group("/medicines", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      medicineService: DiContainer.get(MedicineService),
    }))
    .get(
      "",
      ({ medicineService, query }) => medicineService.getMedicines(query),
      {
        query: filterMedicinesModel,
      },
    )

    .post(
      "",
      ({ body, medicineService }) => medicineService.addMedicine(body),
      {
        body: addMedicineModel,
      },
    )

    .put(
      "",
      ({ body, medicineService }) => medicineService.updateMedicine(body),

      {
        body: updateMedicineModel,
      },
    )
    .get(
      "patient",
      ({ medicineService, query }) =>
        medicineService.getPatientMedicines(query),
      {
        query: filterPatientMedicinesModel,
      },
    )
    .post(
      "patient",
      ({ body, medicineService, user }) =>
        medicineService.addPatientMedicine({ ...body, createdBy: user.id }),

      {
        body: addPatientMedicineModel,
      },
    )
    .put(
      "patient",
      ({ body, medicineService, user }) =>
        medicineService.updatePatientMedicine({ ...body, updatedBy: user.id }),

      {
        body: updatePatientMedicineModel,
      },
    ),
);
