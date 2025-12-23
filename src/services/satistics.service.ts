import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TGetSatisticsDto } from "../types/satistics.type";
import { TDbContext } from "../db/drizzle";
import { and, count, eq, gte, lte, isNotNull } from "drizzle-orm";
import {
  disclosures,
  ratings,
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

    return {
      addedDisclosuresCount,
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

    const systemRatings = await this.db.select().from(ratings);

    const ratingResults = systemRatings.map(async (r) => {
      const _ratings = await this.db
        .select({
          id: disclosures.id,
          createdAt: disclosures.createdAt,
        })
        .from(disclosures)
        .where(
          and(
            gte(disclosures.createdAt, fromDate),
            lte(disclosures.createdAt, toDate),
            eq(disclosures.ratingId, r.id),
            eq(disclosures.isCustomRating, false),
            employeeId
              ? eq(disclosures.createdBy, employeeId)
              : undefined,
          ),
        )
        .orderBy(disclosures.createdAt);

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
        id: disclosures.id,
        createdAt: disclosures.createdAt,
      })
      .from(disclosures)
      .where(
        and(
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          eq(disclosures.isCustomRating, true),
          isNotNull(disclosures.customRating),
          employeeId
            ? eq(disclosures.createdBy, employeeId)
            : undefined,
        ),
      )
      .orderBy(disclosures.createdAt);
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

    return {
      addedDisclosures: groupedByAddedDisclosures,
      ratings: resolvedRatingResults,
    };
  }
}
