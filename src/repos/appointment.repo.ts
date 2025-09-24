import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { appointments } from "../db/schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import {
  TAddAppointmentDto,
  TFilterAppointmentsDto,
  TUpdateAppointmentDto,
} from "../types/appointment.type";

@injectable()
export class AppointmentRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ fromDate, toDate }: TFilterAppointmentsDto) {
    const dateFilters = and(
      gte(appointments.date, fromDate),
      lte(appointments.date, toDate),
    );
    return {
      dateFilters,
    };
  }

  private async getCount(dto: TFilterAppointmentsDto) {
    const { dateFilters } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(appointments)
      .where(dateFilters);
    return totalCount;
  }

  async findManyInTimePeriod(dto: TFilterAppointmentsDto): Promise<{
    totalCount: number;
    appointments: Record<string, number>;
  }> {
    const totalCount = await this.getCount(dto);
    const { dateFilters } = this.getFilters(dto);

    const result = await this.db.query.appointments.findMany({
      where: and(dateFilters),
    });

    const appointments = result.reduce(
      (acc, curr) => {
        if (curr.date in acc) {
          acc[curr.date]++;
        } else {
          acc[curr.date] = 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return { appointments, totalCount };
  }

  async findManyByDateWithIncludes(date: string) {
    const result = await this.db.query.appointments.findMany({
      where: eq(appointments.date, date),
      with: {
        createdBy: true,
        updatedBy: true,
        disclosure: {
          with: {
            patient: true,
          },
        },
      },
    });
    return result;
  }

  async findManyDisclosureAppointsmentsWithIncludes(disclosureId: string) {
    const result = await this.db.query.appointments.findMany({
      where: eq(appointments.disclosureId, disclosureId),
      with: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return result;
  }

  async create(dto: TAddAppointmentDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(appointments).values(dto);
  }

  async update(dto: TUpdateAppointmentDto, tx?: TDbContext) {
    const { id, disclosureId, ...rest } = dto;
    return await (tx ?? this.db)
      .update(appointments)
      .set(rest)
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.disclosureId, disclosureId),
        ),
      );
  }
}
