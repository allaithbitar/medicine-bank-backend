import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { priorityDegrees } from "../db/schema";
import { eq, ilike } from "drizzle-orm";
import {
  TAddPriorityDegreeDto,
  TFilterPriorityDegreesDto,
  TPriorityDegree,
  TUpdatePriorityDegreeDto,
} from "../types/priority-degree.type";

@injectable()
export class PriorityDegreeRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ name }: TFilterPriorityDegreesDto) {
    const nameFilter = name
      ? ilike(priorityDegrees.name, `%${name}%`)
      : undefined;
    return {
      nameFilter,
    };
  }

  async findMany(
    filters: TFilterPriorityDegreesDto,
  ): Promise<TPriorityDegree[]> {
    const { nameFilter } = this.getFilters(filters);

    const result = await this.db.query.priorityDegrees.findMany({
      where: nameFilter,
    });

    return result;
  }

  async create(dto: TAddPriorityDegreeDto, tx?: TDbContext) {
    await (tx ?? this.db).insert(priorityDegrees).values(dto);
  }

  async update(dto: TUpdatePriorityDegreeDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    await (tx ?? this.db)
      .update(priorityDegrees)
      .set(rest)
      .where(eq(priorityDegrees.id, id));
  }
}
