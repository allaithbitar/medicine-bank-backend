import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { areas, areasToEmployees, cities, patients } from "../db/schema";
import { and, count, eq, ilike, sql } from "drizzle-orm";
import {
  TAddAreaDto,
  TArea,
  TFilterAreasDto,
  TUpdateAreaDto,
} from "../types/area.type";
import { TPaginatedResponse } from "../types/common.types";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { ERROR_CODES, NotFoundError } from "../constants/errors";

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

    const result = await this.db
      .select({
        id: areas.id,
        name: areas.name,
        cityId: areas.cityId,
        city: {
          id: cities.id,
          name: cities.name,
        },
        patientsCount: sql<number>`(SELECT COUNT (*) FROM ${patients} WHERE ${eq(patients.areaId, areas.id)})`,
      })
      .from(areas)
      .leftJoin(cities, eq(areas.cityId, cities.id))
      .where(and(nameFilter, cityIdFilter))
      .limit(pageSize)
      .offset(pageSize * pageNumber);

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async findById(id: string): Promise<TArea> {
    const res = await this.db.query.areas.findFirst({
      where: eq(areas.id, id),
    });
    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
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
