import { inject, injectable } from "inversify";
import "reflect-metadata";
import { PatientRepo } from "../repos/patient.repo";
import { TAddPatientDto, TUpdatePatientDto } from "../types/patient.type";
@injectable()
export class PatientService {
  constructor(@inject(PatientRepo) private pateintRepo: PatientRepo) {}

  addPatient(dto: TAddPatientDto) {
    return this.pateintRepo.create(dto);
  }

  updatePatient(dto: TUpdatePatientDto) {
    return this.pateintRepo.update(dto);
  }
}
