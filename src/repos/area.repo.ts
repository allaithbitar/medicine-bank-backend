import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { areas } from "../db/schema";
import { and, count, eq, ilike } from "drizzle-orm";
import {
  TAddAreaDto,
  TArea,
  TFilterAreasDto,
  TUpdateAreaDto,
} from "../types/area.type";
import { TPaginatedResponse } from "../types/common.types";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

@injectable()
export class AreaRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ name, cityId }: TFilterAreasDto) {
    const nameFilter = name ? ilike(areas.name, `%${name}%`) : undefined;
    const cityIdFilter = cityId ? eq(areas.cityId, cityId) : undefined;
    return {
      nameFilter,
      cityIdFilter,
    };
  }

  private async getCount(dto: TFilterAreasDto) {
    const { nameFilter, cityIdFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(areas)
      .where(and(nameFilter, cityIdFilter));

    return totalCount;
  }

  async findManyPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterAreasDto): Promise<TPaginatedResponse<TArea>> {
    const totalCount = await this.getCount(rest);
    const { nameFilter, cityIdFilter } = this.getFilters(rest);

    const result = await this.db.query.areas.findMany({
      where: and(nameFilter, cityIdFilter),
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async create(dto: TAddAreaDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(areas).values(dto);
  }

  async update(dto: TUpdateAreaDto, tx?: TDbContext) {
    const { id, name } = dto;
    return await (tx ?? this.db)
      .update(areas)
      .set({ name })
      .where(eq(areas.id, id));
  }
}
