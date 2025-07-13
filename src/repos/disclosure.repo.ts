import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { disclosures, disclosuresToRatings, visits } from "../db/schema";
import {
  TAddDisclosureDto,
  TAddDisclosureRatingDto,
  TAddDisclosureVisitDto,
  TFilterDisclosuresDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";

@injectable()
export class DisclosureRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private async getFilters({
    createdAtEnd,
    createdAtStart,
    employeeIds,
    ratingIds,
    status,
  }: TFilterDisclosuresDto) {
    let ratingsFilter = undefined;

    let employeeFilter = undefined;

    const createdAtStartFilter = createdAtStart
      ? gte(disclosures.createdAt, createdAtStart)
      : undefined;

    const createdAtEndFilter = createdAtEnd
      ? lte(disclosures.createdAt, createdAtEnd)
      : undefined;

    const statusFilter = status ? eq(disclosures.status, status) : undefined;

    if (ratingIds?.length) {
      const _ids = await this.db.query.disclosuresToRatings.findMany({
        where: inArray(disclosuresToRatings.ratingId, ratingIds),
        columns: { disclosureId: true },
      });
      ratingsFilter = _ids.length
        ? inArray(
            disclosures.id,
            _ids.map((i) => i.disclosureId!),
          )
        : undefined;
    }

    if (employeeIds?.length) {
      employeeFilter = inArray(disclosures.employeeId, employeeIds);
    }
    return {
      ratingsFilter,
      employeeFilter,
      createdAtStartFilter,
      createdAtEndFilter,
      statusFilter,
    };
  }

  private async getCount(dto: TFilterDisclosuresDto) {
    const {
      createdAtEndFilter,
      createdAtStartFilter,
      employeeFilter,
      ratingsFilter,
      statusFilter,
    } = await this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosures)
      .where(
        and(
          createdAtEndFilter,
          createdAtStartFilter,
          employeeFilter,
          ratingsFilter,
          statusFilter,
        ),
      );
    return totalCount;
  }

  private async getBase({
    pageNumber,
    pageSize,
    ...rest
  }: TFilterDisclosuresDto = {}) {
    const {
      createdAtEndFilter,
      createdAtStartFilter,
      employeeFilter,
      ratingsFilter,
      statusFilter,
    } = await this.getFilters(rest);

    const result = await this.db.query.disclosures.findMany({
      with: {
        employee: {
          columns: { id: true, name: true },
        },
        patient: true,
        prioriy: true,
        ratings: {
          with: {
            rating: true,
          },
        },
      },
      where: and(
        createdAtEndFilter,
        createdAtStartFilter,
        employeeFilter,
        ratingsFilter,
        statusFilter,
      ),
      limit: pageSize,
      offset: pageNumber,
    });

    const totalCount = await this.getCount(rest);

    return { items: result, totalCount, pageSize, pageNumber };
  }

  async create(createDto: TAddDisclosureDto, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db).insert(disclosures).values(createDto);
  }

  async findManyWithIncludesPaginated(dto: TFilterDisclosuresDto) {
    return await this.getBase(dto);
  }

  async addDisclosureRating(dto: TAddDisclosureRatingDto) {
    return await this.db.insert(disclosuresToRatings).values(dto);
  }

  async updateDislosureRating({ id, ...rest }: TUpdateDisclosureRatingDto) {
    return await this.db
      .update(disclosuresToRatings)
      .set(rest)
      .where(eq(disclosuresToRatings.id, id));
  }

  async addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    return await this.db.insert(visits).values(dto);
  }

  async updateDislosureVisit({ id, ...rest }: TUpdateDisclosureVisitDto) {
    return await this.db.update(visits).set(rest).where(eq(visits.id, id));
  }
}
