import "reflect-metadata";
import { inject, injectable } from "inversify";
import {
  TAddMedicineDto,
  TAddPatientMedicineDto,
  TFilterMedicinesDto,
  TFilterPatientMedicinesDto,
  TUpdateMedicineDto,
  TUpdatePatientMedicineDto,
} from "../types/medicine.type";
import { MedicineRepo } from "../repos/medicine.repo";

@injectable()
export class MedicineService {
  constructor(@inject(MedicineRepo) private medicineRepo: MedicineRepo) {}

  getMedicines(dto: TFilterMedicinesDto) {
    return this.medicineRepo.getMedicinesPaginated(dto);
  }

  async addMedicine(dto: TAddMedicineDto) {
    await this.medicineRepo.createMedicine(dto);
  }

  async updateMedicine(dto: TUpdateMedicineDto) {
    await this.medicineRepo.updateMedicine(dto);
  }

  //

  getPatientMedicines(dto: TFilterPatientMedicinesDto) {
    return this.medicineRepo.getPatientMedicinesPaginated(dto);
  }

  async addPatientMedicine(dto: TAddPatientMedicineDto) {
    await this.medicineRepo.createPatientMedicine(dto);
  }

  async updatePatientMedicine(dto: TUpdatePatientMedicineDto) {
    await this.medicineRepo.updatePatientMedicine(dto);
  }
}
