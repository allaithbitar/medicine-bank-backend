import { inject, injectable } from "inversify";
import {
  TAddEmployeeDto,
  TEmployeeEntity,
  TFilterEmployeesDto,
  TUpdateEmployeeDto,
} from "../types/employee.type";
import { TDbContext } from "../db/drizzle";
import { areasToEmployees, employees, patients } from "../db/schema";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { TFilterPatientsDto } from "../types/patient.type";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { ERROR_CODES, NotFoundError } from "../constants/errors";

@injectable()
export class EmployeeRepo {
  constructor(@inject("db") private db: TDbContext) {}

  async create(createDto: TAddEmployeeDto, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db).transaction(async (_x) => {
      const { areaIds, ...rest } = createDto;
      const [{ id }] = await _x
        .insert(employees)
        .values(rest)
        .returning({ id: employees.id });
      if (areaIds?.length) {
        await _x
          .insert(areasToEmployees)
          .values(areaIds.map((aId) => ({ areaId: aId, employeeId: id })));
      }
    });
  }

  async update(updateDto: TUpdateEmployeeDto, tx?: TDbContext): Promise<void> {
    const { id, areaIds, ...rest } = updateDto;
    await (tx ?? this.db).transaction(async (_x) => {
      await _x.update(employees).set(rest).where(eq(employees.id, id));
      await _x
        .delete(areasToEmployees)
        .where(eq(areasToEmployees.employeeId, id));
      if (areaIds?.length) {
        await _x
          .insert(areasToEmployees)
          .values(areaIds.map((aId) => ({ areaId: aId, employeeId: id })));
      }
    });
  }

  async findById(id: string): Promise<TEmployeeEntity | undefined> {
    return this.db.query.employees.findFirst({ where: eq(employees.id, id) });
  }

  async findByPhone(phone: string): Promise<TEmployeeEntity | undefined> {
    return this.db.query.employees.findFirst({
      where: eq(employees.phone, phone),
    });
  }

  private async getFilters({ query, areaIds, role }: TFilterEmployeesDto) {
    let areasFilter;

    const nameFilter = query ? ilike(employees.name, `%${query}%`) : undefined;

    const roleFilter = role?.length ? inArray(employees.role, role) : undefined;

    const phoneFilter = query
      ? ilike(employees.phone, `%${query}%`)
      : undefined;

    if (areaIds?.length) {
      const employeeIds = await this.db.query.areasToEmployees.findMany({
        where: inArray(areasToEmployees.areaId, areaIds),
        columns: { employeeId: true },
      });

      areasFilter = inArray(
        employees.id,
        employeeIds.map((e) => e.employeeId),
      );
    }

    // const areaFilter = areaIds?.length
    //   ? eq(employees.areaId, areaId)
    //   : undefined;

    const queryFilter = or(nameFilter, phoneFilter);

    return {
      queryFilter,
      areasFilter,
      roleFilter,
    };
  }

  private async getCount(dto: TFilterPatientsDto) {
    const { areasFilter, queryFilter, roleFilter } = await this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(employees)
      .where(and(areasFilter, queryFilter, roleFilter));

    return totalCount;
  }

  async findManyWithIncludesPaginated({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TFilterEmployeesDto) {
    const totalCount = await this.getCount(rest);
    const { areasFilter, queryFilter, roleFilter } =
      await this.getFilters(rest);

    const result = await this.db.query.employees.findMany({
      where: and(areasFilter, queryFilter, roleFilter),
      with: {
        areas: {
          with: { area: true },
          columns: { areaId: false, employeeId: false, id: false },
        },
      },
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(employees.createdAt),
      columns: { password: false },
    });
    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async findOneByIdWithIncludes(id: string) {
    const result = await this.db.query.employees.findFirst({
      where: eq(employees.id, id),
      with: {
        areas: {
          with: { area: true },
          columns: { areaId: false, employeeId: false, id: false },
        },
      },
      orderBy: desc(employees.createdAt),
      columns: { password: false },
    });
    return result;
  }
  async getRecommondedScoutsForPatient(patientId: string) {
    const [result] = await this.db
      .select({ areaId: patients.areaId })
      .from(patients)
      .where(eq(patients.id, patientId))
      .execute();

    if (!result?.areaId) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }

    const recommendedScouts = await this.db
      .select({
        id: employees.id,
        name: employees.name,
      })
      .from(employees)
      .leftJoin(areasToEmployees, eq(employees.id, areasToEmployees.employeeId))
      .where(
        and(
          eq(employees.role, "scout"),
          eq(areasToEmployees.areaId, result.areaId),
        ),
      )
      .execute();

    return recommendedScouts;
  }
}
