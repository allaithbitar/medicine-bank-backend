import { inject, injectable } from "inversify";
import {
  TAddEmployeeDto,
  TEmployeeEntity,
  TFilterEmployeesDto,
  TUpdateEmployeeDto,
} from "../types/employee.type";
import { TDbContext } from "../db/drizzle";
import { employees } from "../db/schema";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { TFilterPatientsDto } from "../types/patient.type";

@injectable()
export class EmployeeRepo {
  constructor(@inject("db") private db: TDbContext) {}

  async create(createDto: TAddEmployeeDto, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db).insert(employees).values(createDto);
  }

  async update(updateDto: TUpdateEmployeeDto, tx?: TDbContext): Promise<void> {
    const { id, ...rest } = updateDto;
    await (tx ?? this.db)
      .update(employees)
      .set(rest)
      .where(eq(employees.id, id));
  }

  async findById(id: string): Promise<TEmployeeEntity | undefined> {
    return this.db.query.employees.findFirst({ where: eq(employees.id, id) });
  }

  async findByPhone(phone: string): Promise<TEmployeeEntity | undefined> {
    return this.db.query.employees.findFirst({
      where: eq(employees.phone, phone),
    });
  }

  private getFilters({ query, areaId, role }: TFilterEmployeesDto) {
    const nameFilter = query ? ilike(employees.name, `%${query}%`) : undefined;

    const roleFilter = role?.length ? inArray(employees.role, role) : undefined;

    const phoneFilter = query
      ? ilike(employees.phone, `%${query}%`)
      : undefined;

    const areaFilter = areaId ? eq(employees.areaId, areaId) : undefined;

    const queryFilter = or(nameFilter, phoneFilter);

    return {
      queryFilter,
      areaFilter,
      roleFilter,
    };
  }

  private async getCount(dto: TFilterPatientsDto) {
    const { areaFilter, queryFilter, roleFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(employees)
      .where(and(areaFilter, queryFilter, roleFilter));

    return totalCount;
  }

  async findManyWithIncludesPaginated({
    pageSize,
    pageNumber,
    ...rest
  }: TFilterEmployeesDto) {
    const count = await this.getCount(rest);
    const { areaFilter, queryFilter, roleFilter } = this.getFilters(rest);

    const result = await this.db.query.employees.findMany({
      where: and(areaFilter, queryFilter, roleFilter),
      with: { area: true },
      limit: pageSize,
      offset: pageNumber,
      orderBy: desc(employees.createdAt),
      columns: { password: false },
    });
    return {
      items: result,
      count,
      pageSize,
      pageNumber,
    };
  }
}
