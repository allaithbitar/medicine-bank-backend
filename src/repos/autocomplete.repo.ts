import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { areas, cities, employees, patients } from "../db/schema";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";
import { TAutocompleteDto } from "../types/autocomplete.type";
import { and, count, ilike } from "drizzle-orm";

@injectable()
export class AutocompleteRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters<X, V extends keyof X>(
    query: string | undefined = undefined,
    table: X,
    queryColumns: V[],
  ) {
    const filters = query
      ? and(...queryColumns.map((c) => ilike(table[c] as any, `%${query}%`)))
      : undefined;
    return filters;
  }

  private async getCount<X, V extends keyof X>(
    query: string | undefined = undefined,
    table: X,
    queryColumns: V[],
  ) {
    const filters = this.getFilters(query, table, queryColumns);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(table as any)
      .where(filters);

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
    const totalCount = await this.getCount(query, cities, ["name"]);
    const filters = this.getFilters(query, cities, ["name"]);
    const result = await this.db.query.cities.findMany({
      where: filters,
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
    columns,
  }: TAutocompleteDto<typeof areas>): Promise<TPaginatedResponse<any>> {
    const totalCount = await this.getCount(query, areas, ["name"]);
    const filters = this.getFilters(query, areas, ["name"]);
    const result = await this.db.query.areas.findMany({
      where: filters,
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
    const totalCount = await this.getCount(query, patients, ["name"]);
    const filters = this.getFilters(query, patients, ["name"]);
    const result = await this.db.query.patients.findMany({
      where: filters,
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
    columns,
  }: TAutocompleteDto<typeof employees>): Promise<TPaginatedResponse<any>> {
    const totalCount = await this.getCount(query, employees, ["name"]);
    const filters = this.getFilters(query, employees, ["name"]);
    const result = await this.db.query.employees.findMany({
      where: filters,
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
