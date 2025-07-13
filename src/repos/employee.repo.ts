import { inject, injectable } from "inversify";
import {
  TAddEmployeeDto,
  TEmployeeEntity,
  TUpdateEmployeeDto,
} from "../types/employee.type";
import { TDbContext } from "../db/drizzle";
import { employees } from "../db/schema";
import { eq } from "drizzle-orm";

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
}
