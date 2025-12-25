import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TGetSatisticsDto } from "../types/satistics.type";
import { TDbContext } from "../db/drizzle";
import { and, count, eq, gte, lte, countDistinct } from "drizzle-orm";
import { auditLogs, disclosures, ratings } from "../db/schema";

@injectable()
export class SatisticsService {
  constructor(@inject("db") private db: TDbContext) {}

  async getSummarySatistics(dto: TGetSatisticsDto) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    let [{ count: addedDisclosuresCount }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(
        and(
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          employeeId ? eq(disclosures.createdBy, employeeId) : undefined,
        ),
      );

    let [{ count: completedVisitsCount }] = await this.db
      .select({ count: countDistinct(auditLogs.recordId) })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "completed"),
        ),
      );

    let [{ count: cantBeCompletedVisitsCount }] = await this.db
      .select({ count: countDistinct(auditLogs.recordId) })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "cant_be_completed"),
        ),
      );

    let [{ count: uncompletedVisitsCount }] = await this.db
      .select({ count: countDistinct(auditLogs.recordId) })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "not_completed"),
        ),
      );

    return {
      addedDisclosuresCount,
      uncompletedVisitsCount,
      completedVisitsCount,
      cantBeCompletedVisitsCount,
    };
  }

  async getDetailedSatistics({
    fromDate,
    toDate,
    employeeId,
  }: TGetSatisticsDto) {
    let completedVisits = await this.db
      .selectDistinctOn([auditLogs.recordId], {
        recordId: auditLogs.recordId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "completed"),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(auditLogs.recordId, auditLogs.createdAt);

    let uncompletedVisits = await this.db
      .selectDistinctOn([auditLogs.recordId], {
        recordId: auditLogs.recordId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "not_completed"),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(auditLogs.recordId, auditLogs.createdAt);

    let cantBeCompletedVisits = await this.db
      .selectDistinctOn([auditLogs.recordId], {
        recordId: auditLogs.recordId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.visitResult.name),
          eq(auditLogs.newValue, "cant_be_completed"),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(auditLogs.recordId, auditLogs.createdAt);

    const groupedByCompletedVisits = completedVisits.reduce(
      (acc, curr) => {
        const currentDate = new Date(curr.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.recordId!];
        } else {
          acc[currentDate].push(curr.recordId!);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    let addedDisclosures = await this.db
      .select({ id: disclosures.id, createdAt: disclosures.createdAt })
      .from(disclosures)
      .where(
        and(
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          employeeId ? eq(disclosures.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(disclosures.createdAt);

    const systemRatings = await this.db.select().from(ratings);

    const ratingResults = systemRatings.map(async (r) => {
      const _ratings = await this.db
        .selectDistinctOn([auditLogs.recordId], {
          id: auditLogs.id,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(
          and(
            gte(auditLogs.createdAt, fromDate),
            lte(auditLogs.createdAt, toDate),
            eq(auditLogs.table, "disclosures"),
            eq(auditLogs.column, disclosures.ratingId.name),
            eq(auditLogs.newValue, r.id),
            employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
          ),
        )
        .orderBy(auditLogs.recordId, auditLogs.createdAt);

      const groupedByDate = _ratings.reduce(
        (acc, curr) => {
          const currentDate = new Date(curr.createdAt)
            .toISOString()
            .split("T")[0];
          if (!acc[currentDate]) {
            acc[currentDate] = [curr.id];
          } else {
            acc[currentDate].push(curr.id);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );

      return { ...r, data: groupedByDate };
    });

    let resolvedRatingResults = await Promise.all(ratingResults);

    const _customRatings = await this.db
      .selectDistinctOn([auditLogs.recordId], {
        id: auditLogs.id,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, fromDate),
          lte(auditLogs.createdAt, toDate),
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.column, disclosures.isCustomRating.name),
          eq(auditLogs.newValue, "true"),
          employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(auditLogs.recordId, auditLogs.createdAt);
    const groupedByDate = _customRatings.reduce(
      (acc, curr) => {
        const currentDate = new Date(curr.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.id];
        } else {
          acc[currentDate].push(curr.id);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    resolvedRatingResults.push({
      id: Bun.randomUUIDv7(),
      code: "",
      description: "",
      name: "custom",
      data: groupedByDate,
    });

    const groupedByAddedDisclosures = addedDisclosures.reduce(
      (acc, curr) => {
        const currentDate = new Date(curr.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.id];
        } else {
          acc[currentDate].push(curr.id);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const groupedByUncompletedVisits = uncompletedVisits.reduce(
      (acc, curr) => {
        const currentDate = new Date(curr.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.recordId!];
        } else {
          acc[currentDate].push(curr.recordId!);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const groupedByCantBeCompletedVisits = cantBeCompletedVisits.reduce(
      (acc, curr) => {
        const currentDate = new Date(curr.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.recordId!];
        } else {
          acc[currentDate].push(curr.recordId!);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return {
      addedDisclosures: groupedByAddedDisclosures,
      ratings: resolvedRatingResults,
      completedVisits: groupedByCompletedVisits,
      uncompletedVisits: groupedByUncompletedVisits,
      cantBeCompletedVisits: groupedByCantBeCompletedVisits,
    };
  }
}
