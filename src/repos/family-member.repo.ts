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

  async create(dto: TAddFamilyMemberDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(familyMembers).values(dto);
  }

  async update(dto: TUpdateFamilyMemberDto, tx?: TDbContext) {
    const { id, patientId, ...rest } = dto;
    return await (tx ?? this.db)
      .update(familyMembers)
      .set(rest)
      .where(
        and(eq(familyMembers.id, id), eq(familyMembers.patientId, patientId)),
      );
  }
}
