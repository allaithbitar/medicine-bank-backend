import { inject, injectable } from "inversify";
import "reflect-metadata";
import { PatientRepo } from "../repos/patient.repo";
import {
  TAddPatientDto,
  TFilterPatientsDto,
  TUpdatePatientDto,
} from "../types/patient.type";
@injectable()
export class PatientService {
  constructor(@inject(PatientRepo) private pateintRepo: PatientRepo) {}

  searchPatients(dto: TFilterPatientsDto) {
    return this.pateintRepo.findManyWithIncludesPaginated(dto);
  }

  getPatientById(id: string) {
    return this.pateintRepo.findByIdWithIncludes(id);
  }

  addPatient(dto: TAddPatientDto) {
    return this.pateintRepo.create(dto);
  }

  updatePatient(dto: TUpdatePatientDto) {
    return this.pateintRepo.update(dto);
  }
}
