import { inject, injectable } from "inversify";
import {
  TAddPatientDto,
  TFilterPatientsDto,
  TUpdatePatientDto,
} from "../types/patient.type";
import { TDbContext } from "../db/drizzle";
import { patients, patientsPhoneNumbers } from "../db/schema";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

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
    const { phoneNumbers, id, ...rest } = updateDto;

    await (tx ?? this.db).transaction(async (_tx) => {
      await _tx.update(patients).set(rest).where(eq(patients.id, id));

      await _tx
        .delete(patientsPhoneNumbers)
        .where(eq(patientsPhoneNumbers.patientId, id));

      await _tx
        .insert(patientsPhoneNumbers)
        .values(phoneNumbers.map((phone) => ({ patientId: id, phone })));
    });
  }

  private getFilters({ query, areaIds }: TFilterPatientsDto) {
    const nameFilter = query ? ilike(patients.name, `%${query}%`) : undefined;

    const nationalNumber = query
      ? ilike(patients.nationalNumber, `%${query}%`)
      : undefined;

    const aboutFilter = query ? ilike(patients.about, `%${query}%`) : undefined;

    const addressFilter = query
      ? ilike(patients.address, `%${query}%`)
      : undefined;

    const areaFilter = areaIds?.length
      ? inArray(patients.areaId, areaIds)
      : undefined;

    const queryFilter = or(
      nameFilter,
      nationalNumber,
      aboutFilter,
      addressFilter,
    );

    return {
      queryFilter,
      areaFilter,
    };
  }

  private async getCount(dto: TFilterPatientsDto) {
    const { areaFilter, queryFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(patients)
      .where(and(areaFilter, queryFilter));

    return totalCount;
  }

  private async getBase({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TFilterPatientsDto = {}) {
    const { areaFilter, queryFilter } = this.getFilters(rest);

    const count = await this.getCount(rest);

    const result = await this.db.query.patients.findMany({
      where: and(queryFilter, areaFilter),
      with: {
        area: true,
        phones: true,
      },
      limit: pageSize,
      offset: pageNumber,
      orderBy: desc(patients.createdAt),
    });

    return {
      items: result,
      count,
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
}
