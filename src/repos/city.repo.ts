import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { cities } from "../db/schema";
import {
  TAddCityDto,
  TCity,
  TFilterCitiesDto,
  TUpdateCityDto,
} from "../types/city.type";
import { count, eq, ilike } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";

@injectable()
export class CityRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ name }: TFilterCitiesDto) {
    const nameFilter = name ? ilike(cities.name, `%${name}%`) : undefined;
    return {
      nameFilter,
    };
  }

  private async getCount(dto: TFilterCitiesDto) {
    const { nameFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(cities)
      .where(nameFilter);

    return totalCount;
  }

  async create(dto: TAddCityDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(cities).values(dto);
  }

  async update(dto: TUpdateCityDto, tx?: TDbContext) {
    const { id, name } = dto;
    return await (tx ?? this.db)
      .update(cities)
      .set({ name })
      .where(eq(cities.id, id));
  }

  async findManyPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterCitiesDto): Promise<TPaginatedResponse<TCity>> {
    const totalCount = await this.getCount(rest);
    const { nameFilter } = this.getFilters(rest);

    const result = await this.db.query.cities.findMany({
      where: nameFilter,
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }
}
