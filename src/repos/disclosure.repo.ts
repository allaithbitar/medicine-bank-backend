import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import {
  disclosureNotes,
  disclosures,
} from "../db/schema";
import {
  TAddDisclosureDto,
  TAddDisclosureNoteDto,
  TAddDisclosureNoteEntityDto,
  TFilterDisclosuresDto,
  TGetDisclosureNotesDto,
  TUpdateDisclosureDto,
  TUpdateDisclosureNoteDto,
  TUpdateDisclosureNoteEntityDto,
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
    patientId,
    priorityIds,
    undelivered,
    status,
  }: TFilterDisclosuresDto) {
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
    // Disclosures with no ratings (ratingId is null)
    const disclosuresWithoutRatings = await this.db
      .select({ id: disclosures.id })
      .from(disclosures)
      .where(
        and(
          eq(disclosures.scoutId, fromScoutId),
          isNull(disclosures.ratingId),
        ),
      );

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
