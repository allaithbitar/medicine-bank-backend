import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import {
  disclosureNotes,
  disclosures,
  disclosuresToRatings,
} from "../db/schema";
import {
  TAddDisclosureDto,
  TAddDisclosureNoteDto,
  TAddDisclosureNoteEntityDto,
  TAddDisclosureRatingDto,
  TFilterDisclosuresDto,
  TGetDisclosureNotesDto,
  TGetDisclosureRatingsDto,
  TUpdateDisclosureDto,
  TUpdateDisclosureNoteDto,
  TUpdateDisclosureNoteEntityDto,
  TUpdateDisclosureRatingDto,
} from "../types/disclosure.type";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
} from "drizzle-orm";
import {
  ACTIONER_WITH,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../constants/constants";

const withClause = {
  priority: true,
  createdBy: ACTIONER_WITH,
  patient: true,
  scout: true,
  updatedBy: ACTIONER_WITH,
} as const;

@injectable()
export class DisclosureRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private async getFilters({
    createdAtEnd,
    createdAtStart,
    scoutIds,
    ratingIds,
    patientId,
    priorityIds,
    undelivered,
    status,
  }: TFilterDisclosuresDto) {
    let ratingsFilter = undefined;

    let scoutesFilter = undefined;

    let priorityFilter = undefined;

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

    if (scoutIds?.length) {
      scoutesFilter = inArray(disclosures.scoutId, scoutIds);
    }

    if (priorityIds?.length) {
      priorityFilter = inArray(disclosures.priorityId, priorityIds);
    }

    if (patientId) {
      patientFilter = eq(disclosures.patientId, patientId);
    }

    // if (typeof undelivered !== "undefined") {
    if (undelivered) {
      undeliveredFilter = undelivered
        ? isNull(disclosures.scoutId)
        : isNotNull(disclosures.scoutId);
    }

    return {
      ratingsFilter,
      scoutesFilter,
      createdAtStartFilter,
      createdAtEndFilter,
      statusFilter,
      patientFilter,
      priorityFilter,
      undeliveredFilter,
    };
  }

  private async getCount(dto: TFilterDisclosuresDto) {
    const {
      createdAtEndFilter,
      createdAtStartFilter,
      scoutesFilter,
      ratingsFilter,
      statusFilter,
      patientFilter,
      priorityFilter,
      undeliveredFilter,
    } = await this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosures)
      .where(
        and(
          createdAtEndFilter,
          createdAtStartFilter,
          scoutesFilter,
          ratingsFilter,
          statusFilter,
          patientFilter,
          priorityFilter,
          undeliveredFilter,
        ),
      );
    return totalCount;
  }

  private async getBase({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterDisclosuresDto = {}) {
    const {
      createdAtEndFilter,
      createdAtStartFilter,
      scoutesFilter,
      ratingsFilter,
      statusFilter,
      patientFilter,
      priorityFilter,
      undeliveredFilter,
    } = await this.getFilters(rest);

    const result = await this.db.query.disclosures.findMany({
      with: withClause,
      where: and(
        createdAtEndFilter,
        createdAtStartFilter,
        scoutesFilter,
        ratingsFilter,
        statusFilter,
        patientFilter,
        priorityFilter,
        undeliveredFilter,
      ),
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(disclosures.createdAt),
    });

    const totalCount = await this.getCount(rest);

    return { items: result, totalCount, pageSize, pageNumber };
  }

  async create(createDto: TAddDisclosureDto, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db).insert(disclosures).values(createDto);
  }

  async update(updateDto: TUpdateDisclosureDto, tx?: TDbContext) {
    const { id, ...rest } = updateDto;
    return await (tx ?? this.db)
      .update(disclosures)
      .set(rest)
      .where(eq(disclosures.id, id))
      .returning();
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

  // RATINGS

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
      limit: pageSize,
      offset: pageSize * pageNumber,
      with: {
        rating: true,
        createdBy: ACTIONER_WITH,
        updatedBy: ACTIONER_WITH,
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
        with: {
          rating: true,
          createdBy: ACTIONER_WITH,
          updatedBy: ACTIONER_WITH,
        },
      })) ?? null
    );
  }

  async addDisclosureRating(dto: TAddDisclosureRatingDto, tx?: TDbContext) {
    return await (tx ?? this.db)
      .insert(disclosuresToRatings)
      .values(dto)
      .returning();
  }

  async updateDislosureRating(
    { id, ...rest }: TUpdateDisclosureRatingDto,
    tx?: TDbContext,
  ) {
    return await (tx ?? this.db)
      .update(disclosuresToRatings)
      .set(rest)
      .where(eq(disclosuresToRatings.id, id))
      .returning();
  }



  async getDisclosuresRatings() {
    return await this.db.query.disclosuresToRatings.findMany({
      with: { rating: true },
    });
  }

  async getDislosureRating(id: string) {
    return await this.db.query.disclosuresToRatings.findFirst({
      where: eq(disclosuresToRatings.id, id),
    });
  }



  // NOTES

  private getNotesFilters({ disclosureId, query }: TGetDisclosureNotesDto) {
    const disclosureIdFilter = eq(disclosureNotes.disclosureId, disclosureId);

    const queryFilter = query
      ? ilike(disclosureNotes.noteText, `%${query}%`)
      : undefined;

    return {
      disclosureIdFilter,
      queryFilter,
    };
  }

  private async getNotesCount(dto: TGetDisclosureNotesDto) {
    const { disclosureIdFilter, queryFilter } = this.getNotesFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosureNotes)
      .where(and(disclosureIdFilter, queryFilter));
    return totalCount;
  }

  async getDisclosureNotes({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TGetDisclosureNotesDto) {
    const { disclosureIdFilter, queryFilter } = this.getNotesFilters(rest);

    const totalCount = await this.getNotesCount(rest);

    const result = await this.db.query.disclosureNotes.findMany({
      where: and(disclosureIdFilter, queryFilter),
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(disclosureNotes.createdAt),
      with: { createdBy: ACTIONER_WITH },
    });

    return {
      items: result,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async getDisclosureNote(id: string) {
    return (
      (await this.db.query.disclosureNotes.findFirst({
        where: eq(disclosureNotes.id, id),
        with: { createdBy: ACTIONER_WITH },
      })) ?? null
    );
  }

  async addDisclosureNote(
    dto: Omit<TAddDisclosureNoteEntityDto, "audioFile">,
    tx?: TDbContext,
  ) {
    return await (tx ?? this.db)
      .insert(disclosureNotes)
      .values(dto)
      .returning();
  }

  async updateDisclosureNote(
    dto: TUpdateDisclosureNoteEntityDto,
    tx?: TDbContext,
  ) {
    const { id, disclosureId, ...rest } = dto;
    return await (tx ?? this.db)
      .update(disclosureNotes)
      .set(rest)
      .where(
        and(
          eq(disclosureNotes.id, id),
          eq(disclosureNotes.disclosureId, disclosureId),
        ),
      )
      .returning();
  }

  async moveDisclosures(fromScoutId: string, toScoutId: string) {
    // Disclosures with no ratings
    const disclosuresWithoutRatings = await this.db
      .select({ id: disclosures.id })
      .from(disclosures)
      .leftJoin(
        disclosuresToRatings,
        eq(disclosures.id, disclosuresToRatings.disclosureId),
      )
      .where(
        and(
          eq(disclosures.scoutId, fromScoutId),
          isNull(disclosuresToRatings.id),
        ),
      )
      .groupBy(disclosures.id);

    const disclosureIds = disclosuresWithoutRatings.map((d) => d.id);

    if (disclosureIds.length === 0) return [];



    // Update the scoutId
    const updated = await this.db
      .update(disclosures)
      .set({ scoutId: toScoutId })
      .where(inArray(disclosures.id, disclosureIds))
      .returning();

    return updated;
  }
}
