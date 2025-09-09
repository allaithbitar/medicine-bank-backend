import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TGetSatisticsDto } from "../types/satistics.type";
import { TDbContext } from "../db/drizzle";
import { and, count, eq, gte, lte } from "drizzle-orm";
import {
  disclosures,
  disclosuresToRatings,
  ratings,
  visits,
} from "../db/schema";

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
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      );

    let [{ count: uncompletedVisitsCount }] = await this.db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "not_completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      );

    let [{ count: cantBeCompletedVisitsCount }] = await this.db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "cant_be_completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      );

    return {
      addedDisclosuresCount,
      completedVisitsCount,
      uncompletedVisitsCount,
      cantBeCompletedVisitsCount,
    };
  }

  async getDetailedSatistics(dto: TGetSatisticsDto) {
    const { fromDate, toDate, employeeId } = dto ?? {};

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

    let completedVisits = await this.db
      .select({ id: visits.id, createdAt: visits.createdAt })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(visits.createdAt);

    let uncompletedVisits = await this.db
      .select({ id: visits.id, createdAt: visits.createdAt })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "not_completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(visits.createdAt);

    let cantBeCompletedVisits = await this.db
      .select({ id: visits.id, createdAt: visits.createdAt })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, fromDate),
          lte(visits.createdAt, toDate),
          eq(visits.result, "cant_be_completed"),
          employeeId ? eq(visits.createdBy, employeeId) : undefined,
        ),
      )
      .orderBy(visits.createdAt);

    const systemRatings = await this.db.select().from(ratings);

    const ratingResults = systemRatings.map(async (r) => {
      const _ratings = await this.db
        .select({
          id: disclosuresToRatings.id,
          createdAt: disclosuresToRatings.createdAt,
        })
        .from(disclosuresToRatings)
        .where(
          and(
            gte(disclosuresToRatings.createdAt, fromDate),
            lte(disclosuresToRatings.createdAt, toDate),
            eq(disclosuresToRatings.ratingId, r.id),
            employeeId
              ? eq(disclosuresToRatings.createdBy, employeeId)
              : undefined,
          ),
        )
        .orderBy(disclosuresToRatings.createdAt);

      const groupedByDate = _ratings.reduce(
        (acc, curr) => {
          const currentDate = curr.createdAt.split(" ")[0];
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
      .select({
        id: disclosuresToRatings.id,
        createdAt: disclosuresToRatings.createdAt,
      })
      .from(disclosuresToRatings)
      .where(
        and(
          gte(disclosuresToRatings.createdAt, fromDate),
          lte(disclosuresToRatings.createdAt, toDate),
          eq(disclosuresToRatings.isCustom, true),
          employeeId
            ? eq(disclosuresToRatings.createdBy, employeeId)
            : undefined,
        ),
      )
      .orderBy(disclosuresToRatings.createdAt);
    const groupedByDate = _customRatings.reduce(
      (acc, curr) => {
        const currentDate = curr.createdAt.split(" ")[0];
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
        const currentDate = curr.createdAt.split(" ")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.id];
        } else {
          acc[currentDate].push(curr.id);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const groupedByCompletedVisits = completedVisits.reduce(
      (acc, curr) => {
        const currentDate = curr.createdAt.split(" ")[0];
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
        const currentDate = curr.createdAt.split(" ")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.id];
        } else {
          acc[currentDate].push(curr.id);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const groupedByCantBeCompletedVisits = cantBeCompletedVisits.reduce(
      (acc, curr) => {
        const currentDate = curr.createdAt.split(" ")[0];
        if (!acc[currentDate]) {
          acc[currentDate] = [curr.id];
        } else {
          acc[currentDate].push(curr.id);
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return {
      addedDisclosures: groupedByAddedDisclosures,
      completedVisits: groupedByCompletedVisits,
      uncompletedVisits: groupedByUncompletedVisits,
      cantBeCompletedVisits: groupedByCantBeCompletedVisits,
      ratings: resolvedRatingResults,
    };
  }
}
