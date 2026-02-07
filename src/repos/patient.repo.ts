import { inject, injectable } from "inversify";
import {
  TAddPatientDto,
  TFilterPatientsDto,
  TPatient,
  TUpdatePatientDto,
  TValidatePatientNationalNumberDto,
  TValidatePatientPhoneNumbersDto,
} from "../types/patient.type";
import { TDbContext } from "../db/drizzle";
import { patients, patientsPhoneNumbers } from "../db/schema";
import { and, count, desc, eq, ilike, inArray, ne, SQL } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { searchArabic } from "../db/helpers";
import { TPaginatedResponse } from "../types/common.types";

@injectable()
export class PatientRepo {
  constructor(@inject("db") private db: TDbContext) {}
  async create(
    createDto: TAddPatientDto,
    tx?: TDbContext,
  ): Promise<{ id: string }> {
    const { phoneNumbers, ...rest } = createDto;

    let createdId = "";
    await (tx ?? this.db).transaction(async (_tx) => {
      const [{ id }] = await _tx
        .insert(patients)
        .values(rest)
        .returning({ id: patients.id });

      createdId = id;

      await _tx
        .insert(patientsPhoneNumbers)
        .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
    });
    return { id: createdId };
  }

  async update(updateDto: TUpdatePatientDto, tx?: TDbContext): Promise<void> {
    const { phoneNumbers, id, ...rest } = updateDto;

    await (tx ?? this.db).transaction(async (_tx) => {
      await _tx.update(patients).set(rest).where(eq(patients.id, id));

      if (phoneNumbers) {
        await _tx
          .delete(patientsPhoneNumbers)
          .where(eq(patientsPhoneNumbers.patientId, id));

        await _tx
          .insert(patientsPhoneNumbers)
          .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
      }
    });
  }

  private async getFilters({
    name,
    about,
    address,
    areaIds,
    birthDate,
    gender,
    job,
    nationalNumber,
    phone,
  }: TFilterPatientsDto) {
    // const nameFilter = query ? ilike(patients.name, `%${query}%`) : undefined;

    const nameFilter = name ? searchArabic(patients.name, name) : undefined;

    const nationalNumberFilter = nationalNumber
      ? ilike(patients.nationalNumber, `%${nationalNumber}%`)
      : undefined;

    const aboutFilter = about ? ilike(patients.about, `%${about}%`) : undefined;

    const addressFilter = address
      ? ilike(patients.address, `%${address}%`)
      : undefined;

    const areaFilter = areaIds?.length
      ? inArray(patients.areaId, areaIds)
      : undefined;

    const birthDateFilter = birthDate
      ? eq(patients.birthDate, birthDate)
      : undefined;

    const genderFilter = gender ? eq(patients.gender, gender) : undefined;

    const jobFilter = job ? eq(patients.job, job) : undefined;

    let phoneFilter = undefined;

    if (phone) {
      const patinetIds = await this.db
        .select({ id: patientsPhoneNumbers.patientId })
        .from(patientsPhoneNumbers)
        .where(ilike(patientsPhoneNumbers.phone, `%${phone}%`));

      if (patinetIds.length) {
        phoneFilter = inArray(
          patients.id,
          patinetIds.map((p) => p.id),
        );
      }
    }

    return {
      areaFilter,
      nameFilter,
      nationalNumberFilter,
      aboutFilter,
      addressFilter,
      birthDateFilter,
      genderFilter,
      jobFilter,
      phoneFilter,
    };
  }

  private async getCount(filters: SQL<unknown> | undefined) {
    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(patients)
      .where(filters);

    return totalCount;
  }

  private async getBase({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TFilterPatientsDto): Promise<TPaginatedResponse<TPatient>> {
    const filters = await this.getFilters(rest);

    const where = and(...Object.values(filters));

    const totalCount = await this.getCount(where);

    const result = await this.db.query.patients.findMany({
      where,
      with: {
        area: true,
        phones: true,
      },
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(patients.createdAt),
    });

    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async findManyWithIncludesPaginated(dto: TFilterPatientsDto) {
    return this.getBase(dto);
  }

  async findByIdWithIncludes(id: string) {
    const result = await this.db.query.patients.findFirst({
      where: eq(patients.id, id),
      with: {
        area: true,
        phones: true,
      },
    });

    return result || null;
  }

  async validateNationalNumber(dto: TValidatePatientNationalNumberDto) {
    const existing = await this.db.query.patients.findFirst({
      where: and(
        eq(patients.nationalNumber, dto.nationalNumber),
        dto.patientId ? ne(patients.id, dto.patientId) : undefined,
      ),
    });

    return {
      existing,
    };
  }

  async validatePhoneNumbers(dto: TValidatePatientPhoneNumbersDto) {
    const existing = await this.db.query.patientsPhoneNumbers.findFirst({
      where: and(
        inArray(patientsPhoneNumbers.phone, dto.phoneNumbers),
        dto.patientId
          ? ne(patientsPhoneNumbers.patientId, dto.patientId)
          : undefined,
      ),
      with: {
        patient: true,
      },
    });

    return {
      existing,
    };
  }
}
