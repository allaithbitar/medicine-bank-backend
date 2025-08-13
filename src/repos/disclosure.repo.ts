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
  TUpdateDisclosureDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
} from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

const withClause = {
  employee: {
    columns: { id: true, name: true },
  },
  patient: {
    with: { phones: true, area: true },
  },
  priority: true,
} as const;

@injectable()
export class DisclosureRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private async getFilters({
    createdAtEnd,
    createdAtStart,
    employeeIds,
    ratingIds,
    patientId,
    priorityIds,
    undelivered,
    status,
  }: TFilterDisclosuresDto) {
    let ratingsFilter = undefined;

    let employeeFilter = undefined;

    let priortyFilter = undefined;

    let patientFilter = undefined;

    let undeliveredFilter = undefined;

    const createdAtStartFilter = createdAtStart
      ? gte(disclosures.createdAt, createdAtStart)
      : undefined;

    const createdAtEndFilter = createdAtEnd
      ? lte(disclosures.createdAt, createdAtEnd)
      : undefined;

    const statusFilter = status?.length
      ? inArray(disclosures.status, status)
      : undefined;

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

    if (priorityIds?.length) {
      priortyFilter = inArray(disclosures.priorityId, priorityIds);
    }

    if (patientId) {
      patientFilter = eq(disclosures.patientId, patientId);
    }

    if (typeof undelivered !== "undefined") {
      undeliveredFilter = undelivered
        ? isNull(disclosures.employeeId)
        : isNotNull(disclosures.employeeId);
    }

    return {
      ratingsFilter,
      employeeFilter,
      createdAtStartFilter,
      createdAtEndFilter,
      statusFilter,
      patientFilter,
      priortyFilter,
      undeliveredFilter,
    };
  }

  private async getCount(dto: TFilterDisclosuresDto) {
    const {
      createdAtEndFilter,
      createdAtStartFilter,
      employeeFilter,
      ratingsFilter,
      statusFilter,
      patientFilter,
      priortyFilter,
      undeliveredFilter,
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
          patientFilter,
          priortyFilter,
          undeliveredFilter,
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
      patientFilter,
      priortyFilter,
      undeliveredFilter,
    } = await this.getFilters(rest);

    const result = await this.db.query.disclosures.findMany({
      with: withClause,
      where: and(
        createdAtEndFilter,
        createdAtStartFilter,
        employeeFilter,
        ratingsFilter,
        statusFilter,
        patientFilter,
        priortyFilter,
        undeliveredFilter,
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

  async update(
    updateDto: TUpdateDisclosureDto,
    tx?: TDbContext,
  ): Promise<void> {
    const { id, ...rest } = updateDto;
    await (tx ?? this.db)
      .update(disclosures)
      .set(rest)
      .where(eq(disclosures.id, id));
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
      orderBy: desc(disclosuresToRatings.createdAt),
    });
    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async getDisclosureRating(id: string) {
    return (
      (await this.db.query.disclosuresToRatings.findFirst({
        where: eq(disclosuresToRatings.id, id),
        with: { rating: true },
      })) ?? null
    );
  }

  async addDisclosureRating(dto: TAddDisclosureRatingDto) {
    await this.db.insert(disclosuresToRatings).values(dto);
  }

  async updateDislosureRating({ id, ...rest }: TUpdateDisclosureRatingDto) {
    await this.db
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
      orderBy: desc(visits.createdAt),
    });

    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async getDisclosureVisit(id: string) {
    return (
      (await this.db.query.visits.findFirst({
        where: eq(visits.id, id),
      })) ?? null
    );
  }

  async addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    return await this.db.insert(visits).values(dto);
  }

  async updateDislosureVisit({ id, ...rest }: TUpdateDisclosureVisitDto) {
    return await this.db.update(visits).set(rest).where(eq(visits.id, id));
  }

  async getDisclosuresRatings() {
    return await this.db.query.disclosuresToRatings.findMany({
      with: { rating: true },
    });
  }

  async getDisclosuresVisits() {
    return await this.db.query.visits.findMany();
  }
}
