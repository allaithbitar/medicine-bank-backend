import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { and, count, eq, gte, lte } from "drizzle-orm";
import {
  TAddDisclosureConsultationEntityDto,
  TGetDisclosureConsultationsDto,
  TUpdateDisclosureConsultationEntityDto,
} from "../types/disclosure.type";
import { disclosureConsultations } from "../db/schema";
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
        disclosure: {
          with: { rating: true },
        },
        consultedBy: ACTIONER_WITH,
        createdBy: ACTIONER_WITH,
        updatedBy: ACTIONER_WITH,
      },
      orderBy: (disclosureConsultations, { desc }) =>
        desc(disclosureConsultations.createdAt),
    });

    const totalCount = await this.getCount(rest);

    return { items: result, totalCount, pageSize, pageNumber };
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
          with: { rating: true },
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

