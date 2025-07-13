import { inject, injectable } from "inversify";
import { TAddPatientDto, TUpdatePatientDto } from "../types/patient.type";
import { TDbContext } from "../db/drizzle";
import { patients, patientsPhoneNumbers } from "../db/schema";
import { eq } from "drizzle-orm";

@injectable()
export class PatientRepo {
  constructor(@inject("db") private db: TDbContext) {}
  async create(createDto: TAddPatientDto, tx?: TDbContext): Promise<void> {
    const { phoneNumbers, ...rest } = createDto;

    await (tx ?? this.db).transaction(async (_tx) => {
      const [{ id }] = await _tx
        .insert(patients)
        .values(rest)
        .returning({ id: patients.id });

      await _tx
        .insert(patientsPhoneNumbers)
        .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
    });
  }

  async update(updateDto: TUpdatePatientDto, tx?: TDbContext): Promise<void> {
    const { phoneNumbers, ...rest } = updateDto;

    await (tx ?? this.db).transaction(async (_tx) => {
      const [{ id }] = await _tx
        .update(patients)
        .set(rest)
        .returning({ id: patients.id });

      await _tx
        .delete(patientsPhoneNumbers)
        .where(eq(patientsPhoneNumbers.patientId, id));

      await _tx
        .insert(patientsPhoneNumbers)
        .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
    });
  }
}
