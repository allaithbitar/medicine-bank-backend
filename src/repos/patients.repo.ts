import { inject, injectable } from "inversify";
import IGenericRepo from "./generic.repo";
import {
  TAddPatientDto,
  TPatient,
  TUpdatePatientDto,
} from "../types/patient.type";
import { TDbContext } from "../db/drizzle";
import { patients, patientsPhoneNumbers } from "../db/schema";

@injectable()
export class PatientRepo
  implements IGenericRepo<TPatient, TAddPatientDto, TUpdatePatientDto, any, {}>
{
  constructor(@inject("db") private db: TDbContext) {}
  async create(createDto: TAddPatientDto, tx?: TDbContext): Promise<void> {
    const { phoneNumbers, ...rest } = createDto;

    await (tx ?? this.db).transaction(async (_tx) => {
      const [{ id }] = await _tx
        .insert(patients)
        .values(rest)
        .returning({ id: patients.id });

      if (phoneNumbers?.length) {
        await _tx
          .insert(patientsPhoneNumbers)
          .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
      }
    });
  }
}
