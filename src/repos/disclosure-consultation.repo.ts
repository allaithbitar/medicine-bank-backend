import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";
import {
  TAddDisclosureConsultationEntityDto,
  TGetDisclosureConsultationsDto,
  TUpdateDisclosureConsultationEntityDto,
} from "../types/disclosure.type";
import { disclosureConsultations, disclosures, patients } from "../db/schema";
import {
  ACTIONER_WITH,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../constants/constants";

@injectable()
export class DisclosureConsultationRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({
    disclosureId,
    consultationStatus,
    consultedBy,
    createdBy,
    createdAtStart,
    createdAtEnd,
  }: TGetDisclosureConsultationsDto) {
    const disclosureIdFilter = disclosureId
      ? eq(disclosureConsultations.disclosureId, disclosureId)
      : undefined;

    const consultationStatusFilter = consultationStatus
      ? eq(disclosureConsultations.consultationStatus, consultationStatus)
      : undefined;

    const consultedByFilter = consultedBy
      ? eq(disclosureConsultations.consultedBy, consultedBy)
      : undefined;

    const createdByFilter = createdBy
      ? eq(disclosureConsultations.createdBy, createdBy)
      : undefined;

    const createdAtStartFilter = createdAtStart
      ? gte(disclosureConsultations.createdAt, createdAtStart)
      : undefined;

    const createdAtEndFilter = createdAtEnd
      ? lte(disclosureConsultations.createdAt, createdAtEnd)
      : undefined;

    return {
      disclosureIdFilter,
      consultationStatusFilter,
      consultedByFilter,
      createdByFilter,
      createdAtStartFilter,
      createdAtEndFilter,
    };
  }

  async create(dto: TAddDisclosureConsultationEntityDto, tx?: TDbContext) {
    return await (tx ?? this.db)
      .insert(disclosureConsultations)
      .values(dto)
      .returning();
  }

  async update(dto: TUpdateDisclosureConsultationEntityDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    return await (tx ?? this.db)
      .update(disclosureConsultations)
      .set(rest)
      .where(eq(disclosureConsultations.id, id))
      .returning();
  }

  async findManyWithIncludesPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TGetDisclosureConsultationsDto) {
    const {
      disclosureIdFilter,
      consultationStatusFilter,
      consultedByFilter,
      createdByFilter,
      createdAtStartFilter,
      createdAtEndFilter,
    } = this.getFilters(rest);

    const result = await this.db.query.disclosureConsultations.findMany({
      where: and(
        disclosureIdFilter,
        consultationStatusFilter,
        consultedByFilter,
        createdByFilter,
        createdAtStartFilter,
        createdAtEndFilter,
      ),
      limit: pageSize,
      offset: pageSize * pageNumber,
      with: {
        consultedBy: ACTIONER_WITH,
        createdBy: ACTIONER_WITH,
        updatedBy: ACTIONER_WITH,
      },
      orderBy: (disclosureConsultations, { desc }) =>
        desc(disclosureConsultations.createdAt),
    });

    const disclosureIds = [...new Set(result.map((d) => d.disclosureId))];

    const patientIdsAndDisclosureIds = await this.db
      .select({
        disclosureId: disclosures.id,
        patientId: disclosures.patientId,
      })
      .from(disclosures)
      .where(inArray(disclosures.id, disclosureIds));

    const patientIds = patientIdsAndDisclosureIds.map((i) => i.patientId);

    const disclosureIdPatientIdDictionary = patientIdsAndDisclosureIds.reduce(
      (acc, curr) => {
        acc[curr.disclosureId] = curr.patientId;
        return acc;
      },
      {} as Record<string, string>,
    );

    const patientsData = await this.db
      .select()
      .from(patients)
      .where(inArray(patients.id, patientIds));

    const itemsWithPatients = result.map((item) => {
      const patientId = disclosureIdPatientIdDictionary[item.disclosureId];
      const patient = patientsData.find((p) => p.id === patientId);
      return {
        ...item,
        patient,
      };
    });
    console.log(itemsWithPatients);

    const totalCount = await this.getCount(rest);

    return { items: itemsWithPatients, totalCount, pageSize, pageNumber };
  }

  async getById(id: string) {
    return await this.db.query.disclosureConsultations.findFirst({
      where: eq(disclosureConsultations.id, id),
    });
  }

  async getByIdWithIncludes(id: string) {
    return await this.db.query.disclosureConsultations.findFirst({
      where: eq(disclosureConsultations.id, id),
      with: {
        disclosure: {
          with: { rating: true, patient: true },
        },
        consultedBy: ACTIONER_WITH,
        createdBy: ACTIONER_WITH,
        updatedBy: ACTIONER_WITH,
      },
    });
  }

  private async getCount(dto: TGetDisclosureConsultationsDto) {
    const {
      disclosureIdFilter,
      consultationStatusFilter,
      consultedByFilter,
      createdByFilter,
      createdAtStartFilter,
      createdAtEndFilter,
    } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosureConsultations)
      .where(
        and(
          disclosureIdFilter,
          consultationStatusFilter,
          consultedByFilter,
          createdByFilter,
          createdAtStartFilter,
          createdAtEndFilter,
        ),
      );
    return totalCount;
  }
}
