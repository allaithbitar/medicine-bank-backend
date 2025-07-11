import { inject, injectable } from "inversify";
import "reflect-metadata";
import { PatientRepo } from "../repos/patients.repo";
import { TAddPatientDto } from "../types/patient.type";
@injectable()
export class PatientService {
  constructor(@inject(PatientRepo) private pateintRepo: PatientRepo) {}

  addPatient(dto: TAddPatientDto) {
    return this.pateintRepo.create(dto);
  }
}
