import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { areas, areasToEmployees, cities } from "../db/schema";
import {
  TAddCityDto,
  TCity,
  TFilterCitiesDto,
  TUpdateCityDto,
} from "../types/city.type";
import { count, eq, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";
import { ERROR_CODES, NotFoundError } from "../constants/errors";

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

    const result = await this.db
      .select({
        id: cities.id,
        name: cities.name,
        areasCount: sql<number>`(SELECT COUNT(*) FROM ${areas} WHERE ${eq(areas.cityId, cities.id)})`,
        employeesCount: sql<number>`(
          SELECT COUNT(DISTINCT ${areasToEmployees.employeeId}) 
          FROM ${areasToEmployees} 
          INNER JOIN ${areas} ON ${eq(areasToEmployees.areaId, areas.id)}
          WHERE ${eq(areas.cityId, cities.id)}
        )`,
      })
      .from(cities)
      .where(nameFilter)
      .limit(pageSize)
      .offset(pageSize * pageNumber);

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async findById(id: string): Promise<TCity> {
    const res = await this.db.query.cities.findFirst({
      where: eq(cities.id, id),
    });
    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
  }
}
