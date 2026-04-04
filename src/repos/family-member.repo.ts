import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { familyMembers } from "../db/schema";
import { and, count, eq } from "drizzle-orm";
import { TPaginatedResponse } from "../types/common.types";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import {
  TAddFamilyMemberDto,
  TFamilyMember,
  TFilterFamilyMembersDto,
  TUpdateFamilyMemberDto,
} from "../types/family-member.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";
import { noramalizeArabicNumbers } from "../db/helpers";

@injectable()
export class FamilyMemberRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ patientId }: TFilterFamilyMembersDto) {
    const patientFilter = eq(familyMembers.patientId, patientId);
    return {
      patientFilter,
    };
  }

  private async getCount(dto: TFilterFamilyMembersDto) {
    const { patientFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(familyMembers)
      .where(patientFilter);

    return totalCount;
  }

  async findManyPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterFamilyMembersDto): Promise<TPaginatedResponse<TFamilyMember>> {
    const totalCount = await this.getCount(rest);
    const { patientFilter } = this.getFilters(rest);

    const result = await this.db.query.familyMembers.findMany({
      where: patientFilter,
      limit: pageSize,
      offset: pageSize * pageNumber,
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async findById(id: string): Promise<TFamilyMember> {
    const res = await this.db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, id),
    });
    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
  }

  async create(dto: TAddFamilyMemberDto, tx?: TDbContext) {
    if (dto.nationalNumber) {
      dto.nationalNumber = noramalizeArabicNumbers(dto.nationalNumber);
    }

    if (dto.kidsCount) {
      dto.kidsCount = Number(noramalizeArabicNumbers(String(dto.kidsCount)));
    }

    const [addedFamilyMember] = await (tx ?? this.db)
      .insert(familyMembers)
      .values(dto)
      .returning();
    return addedFamilyMember;
  }

  async update(dto: TUpdateFamilyMemberDto, tx?: TDbContext) {
    const { id, patientId, ...rest } = dto;

    if (rest.nationalNumber) {
      rest.nationalNumber = noramalizeArabicNumbers(rest.nationalNumber);
    }

    if (rest.kidsCount) {
      rest.kidsCount = Number(noramalizeArabicNumbers(String(rest.kidsCount)));
    }

    return await (tx ?? this.db)
      .update(familyMembers)
      .set(rest)
      .where(
        and(eq(familyMembers.id, id), eq(familyMembers.patientId, patientId)),
      );
  }
}
