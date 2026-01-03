import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { areas, cities, employees, patients } from "../db/schema";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";
import {
  TAreasAutocompleteDto,
  TAutocompleteDto,
  TEmployeesAutocompleteDto,
} from "../types/autocomplete.type";
import { and, count, eq, inArray, SQL } from "drizzle-orm";
import { searchArabic } from "../db/helpers";

@injectable()
export class AutocompleteRepo {
  constructor(@inject("db") private db: TDbContext) {}

  // private getFilters<X, V extends keyof X>(
  //   query: string | undefined = undefined,
  //   table: X,
  //   queryColumns: V[],
  // ) {
  //   const filters = query
  //     ? and(...queryColumns.map((c) => ilike(table[c] as any, `%${query}%`)))
  //     : undefined;
  //   return filters;
  // }

  private async getCount<X>(where: SQL<unknown> | undefined, table: X) {
    // const filters = this.getFilters(query, table, queryColumns);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(table as any)
      .where(where);

    return totalCount;
  }

  // async create(dto: TAddCityDto, tx?: TDbContext) {
  //   return await (tx ?? this.db).insert(cities).values(dto);
  // }
  //
  // async update(dto: TUpdateCityDto, tx?: TDbContext) {
  //   const { id, name } = dto;
  //   return await (tx ?? this.db)
  //     .update(cities)
  //     .set({ name })
  //     .where(eq(cities.id, id));
  // }

  async getPaginatedCities({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    query,
    columns,
  }: TAutocompleteDto<typeof cities>): Promise<TPaginatedResponse<any>> {
    const queryFilter = query ? searchArabic(cities.name, query) : undefined;
    const where = and(queryFilter);
    const totalCount = await this.getCount(where, cities);
    const result = await this.db.query.cities.findMany({
      where,
      limit: pageSize,
      offset: pageSize * pageNumber,
      columns: {
        id: true,
        name: true,
        ...columns,
      },
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async getPaginatedAreas({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    query,
    cityId,
    columns,
  }: TAreasAutocompleteDto): Promise<TPaginatedResponse<any>> {
    const queryFilter = query ? searchArabic(areas.name, query) : undefined;
    const cityFilter = cityId ? eq(areas.cityId, cityId) : undefined;
    const where = and(queryFilter, cityFilter);
    const totalCount = await this.getCount(where, areas);
    const result = await this.db.query.areas.findMany({
      where,
      limit: pageSize,
      offset: pageSize * pageNumber,
      columns: {
        id: true,
        name: true,
        ...columns,
      },
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async getPaginatedPatients({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    query,
    columns,
  }: TAutocompleteDto<typeof patients>): Promise<TPaginatedResponse<any>> {
    const queryFilter = query ? searchArabic(patients.name, query) : undefined;
    const where = and(queryFilter);
    const totalCount = await this.getCount(where, patients);
    const result = await this.db.query.patients.findMany({
      where,
      limit: pageSize,
      offset: pageSize * pageNumber,
      columns: {
        id: true,
        name: true,
        ...columns,
      },
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async getPaginatedEmployees({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    query,
    role,
    columns,
  }: TEmployeesAutocompleteDto): Promise<TPaginatedResponse<any>> {
    const queryFilter = query ? searchArabic(employees.name, query) : undefined;
    const roleFilter = role?.length ? inArray(employees.role, role) : undefined;
    const where = and(queryFilter, roleFilter);
    const totalCount = await this.getCount(where, employees);
    const result = await this.db.query.employees.findMany({
      where,
      limit: pageSize,
      offset: pageSize * pageNumber,
      columns: {
        id: true,
        name: true,
        ...columns,
      },
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }
}
