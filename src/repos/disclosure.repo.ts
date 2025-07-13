import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { disclosures, disclosuresToRatings, visits } from "../db/schema";
import {
  TAddDisclosureDto,
  TAddDisclosureRatingDto,
  TAddDisclosureVisitDto,
  TFilterDisclosuresDto,
  TGetDisclosureRatingsDto,
  TGetDisclosureVisitsDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

const withClause = {
  employee: {
    columns: { id: true, name: true },
  },
  patient: true,
  prioriy: true,
} as const;

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
      with: withClause,
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

  async getByIdWithIncludes(id: string) {
    return await this.db.query.disclosures.findFirst({
      with: withClause,
      where: eq(disclosures.id, id),
    });
  }

  private getRatingsFilters({
    disclosureId,
    isCustom,
  }: TGetDisclosureRatingsDto) {
    const disclosureIdFilter = eq(
      disclosuresToRatings.disclosureId,
      disclosureId,
    );

    const isCustomFitler =
      typeof isCustom !== "undefined"
        ? eq(disclosuresToRatings.isCustom, isCustom)
        : undefined;

    // const customRatingFilter = customRating
    //   ? ilike(disclosuresToRatings.customRating, `%${customRating}%`)
    //   : undefined;

    return {
      disclosureIdFilter,
      isCustomFitler,
      // customRatingFilter,
    };
  }

  private async getRatingsCount(dto: TGetDisclosureRatingsDto) {
    const { disclosureIdFilter, isCustomFitler } = this.getRatingsFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosuresToRatings)
      .where(and(disclosureIdFilter, isCustomFitler));
    return totalCount;
  }

  async getDislosureRatings({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TGetDisclosureRatingsDto) {
    const totalCount = await this.getRatingsCount(rest);
    const { disclosureIdFilter, isCustomFitler } = this.getRatingsFilters(rest);

    const result = await this.db.query.disclosuresToRatings.findMany({
      where: and(disclosureIdFilter, isCustomFitler),
      offset: pageNumber,
      limit: pageSize,
      with: {
        rating: true,
      },
    });
    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
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

  private getVisitsFilters({ disclosureId, result }: TGetDisclosureVisitsDto) {
    const disclosureIdFilter = eq(visits.disclosureId, disclosureId);

    const resultFilter =
      typeof result !== "undefined" ? eq(visits.result, result) : undefined;

    return {
      disclosureIdFilter,
      resultFilter,
    };
  }

  private async getVisitsCount(dto: TGetDisclosureVisitsDto) {
    const { disclosureIdFilter, resultFilter } = this.getVisitsFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(visits)
      .where(and(disclosureIdFilter, resultFilter));
    return totalCount;
  }

  async getDisclosureVisits({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TGetDisclosureVisitsDto) {
    const { disclosureIdFilter, resultFilter } = this.getVisitsFilters(rest);

    const totalCount = await this.getVisitsCount(rest);

    const result = await this.db.query.visits.findMany({
      where: and(disclosureIdFilter, resultFilter),
      offset: pageNumber,
      limit: pageSize,
    });

    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    return await this.db.insert(visits).values(dto);
  }

  async updateDislosureVisit({ id, ...rest }: TUpdateDisclosureVisitDto) {
    return await this.db.update(visits).set(rest).where(eq(visits.id, id));
  }
}
