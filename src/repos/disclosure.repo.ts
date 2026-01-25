import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import {
  disclosureDetails,
  disclosureNotes,
  disclosures,
  patients,
} from "../db/schema";
import {
  TAddDisclosureDetailsDto,
  TAddDisclosureDto,
  TAddDisclosureNoteEntityDto,
  TFilterDisclosuresDto,
  TGetDateAppointmentsDto,
  TGetDisclosureAppointmentsDto,
  TGetDisclosureNotesDto,
  TUpdateDisclosureDetailsDto,
  TUpdateDisclosureDto,
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
  scout: ACTIONER_WITH,
  updatedBy: ACTIONER_WITH,
  rating: true,
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
    appointmentDate,
    archiveNumber,
    isAppointmentCompleted,
    isCustomRating,
    isReceived,
    ratingIds,
    type,
    visitResult,
    unvisited,
    areaIds,
  }: TFilterDisclosuresDto) {
    let scoutesFilter = undefined;

    let priorityFilter = undefined;

    let patientFilter = undefined;

    let undeliveredFilter = undefined;

    let unvisitedFilter = undefined;

    let areasFilter = undefined;

    const createdAtStartFilter = createdAtStart
      ? gte(disclosures.createdAt, createdAtStart)
      : undefined;

    const createdAtEndFilter = createdAtEnd
      ? lte(disclosures.createdAt, createdAtEnd)
      : undefined;

    const statusFilter = status?.length
      ? inArray(disclosures.status, status)
      : undefined;

    let typeFilter;

    if (scoutIds?.length) {
      scoutesFilter = inArray(disclosures.scoutId, scoutIds);
    }

    if (priorityIds?.length) {
      priorityFilter = inArray(disclosures.priorityId, priorityIds);
    }

    if (patientId) {
      patientFilter = eq(disclosures.patientId, patientId);
    }

    if (type?.length) {
      typeFilter = inArray(disclosures.type, type);
    }

    // if (typeof undelivered !== "undefined") {
    if (undelivered) {
      undeliveredFilter = isNull(disclosures.scoutId);
    }

    if (unvisited) {
      unvisitedFilter = isNull(disclosures.visitResult);
    }

    if (areaIds?.length) {
      areasFilter = inArray(disclosures.patientId, 
        this.db
          .select({ id: patients.id })
          .from(patients)
          .where(inArray(patients.areaId, areaIds))
      );
    }

    let appointmentDateFilter = appointmentDate
      ? eq(disclosures.appointmentDate, appointmentDate)
      : undefined;

    let archiveNumberFilter = archiveNumber
      ? eq(disclosures.archiveNumber, archiveNumber)
      : undefined;

    let isCustomRatingFilter =
      typeof isCustomRating !== "undefined"
        ? eq(disclosures.isCustomRating, isCustomRating)
        : undefined;

    let isAppointmentCompletedFilter =
      typeof isAppointmentCompleted !== "undefined"
        ? eq(disclosures.isAppointmentCompleted, isAppointmentCompleted)
        : undefined;

    let ratingFilter = ratingIds?.length
      ? inArray(disclosures.ratingId, ratingIds)
      : undefined;

    let isReceivedFilter =
      typeof isReceived !== "undefined"
        ? eq(disclosures.isReceived, isReceived)
        : undefined;

    const noramlizedVisitResult = visitResult?.filter((v) => !!v);
    let visitResultFilter = noramlizedVisitResult?.length
      ? inArray(disclosures.visitResult, noramlizedVisitResult)
      : undefined;

    //
    // isReceived,
    //    ratingId,
    //    type,
    //    visitResult,
    return {
      scoutesFilter,
      createdAtStartFilter,
      createdAtEndFilter,
      statusFilter,
      patientFilter,
      priorityFilter,
      undeliveredFilter,
      appointmentDateFilter,
      archiveNumberFilter,
      isCustomRatingFilter,
      isAppointmentCompletedFilter,
      ratingFilter,
      isReceivedFilter,
      typeFilter,
      visitResultFilter,
      unvisitedFilter,
      areasFilter,
    };
  }

  private async getCount(where: any) {
    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(disclosures)
      .where(where);
    return totalCount;
  }

  private async getBase({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterDisclosuresDto = {}) {
    const filters = await this.getFilters(rest);

    const result = await this.db.query.disclosures.findMany({
      with: withClause,
      where: and(...Object.values(filters)),
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(disclosures.createdAt),
    });

    const totalCount = await this.getCount(and(...Object.values(filters)));

    return { items: result, totalCount, pageSize, pageNumber };
  }

  async create(createDto: TAddDisclosureDto, tx?: TDbContext) {
    return await (tx ?? this.db)
      .insert(disclosures)
      .values(createDto)
      .returning();
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
      with: {
        ...withClause,
        patient: {
          with: { phones: true, area: true },
        },
      },
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
    const disclosuresWithoutRatings = await this.db
      .select({ id: disclosures.id })
      .from(disclosures)
      .where(
        and(
          eq(disclosures.scoutId, fromScoutId),
          isNull(disclosures.ratingId),
          isNull(disclosures.customRating),
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

  async getAppointments(dto: TGetDisclosureAppointmentsDto) {
    const result = await this.db
      .select({
        id: disclosures.id,
        appointmentDate: disclosures.appointmentDate,
        isAppointmentCompleted: disclosures.isAppointmentCompleted,
      })
      .from(disclosures)
      .where(
        and(
          isNotNull(disclosures.appointmentDate),
          gte(disclosures.appointmentDate, dto.fromDate),
          lte(disclosures.appointmentDate, dto.toDate),
          dto.scoutId ? eq(disclosures.scoutId, dto.scoutId) : undefined,
          dto.uncompletedOnly
            ? eq(disclosures.isAppointmentCompleted, false)
            : undefined,
        ),
      )
      .orderBy(disclosures.appointmentDate);

    return result.reduce(
      (acc, curr) => {
        if (!acc[curr.appointmentDate!]) acc[curr.appointmentDate!] = [];
        acc[curr.appointmentDate!].push({
          id: curr.id,
          isAppointmentCompleted: curr.isAppointmentCompleted,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          isAppointmentCompleted: boolean;
        }[]
      >,
    );

    // return await this.db.query.disclosures.findMany({
    //   columns: {
    //     id: true,
    //     appointmentDate: true,
    //     isAppointmentCompleted: true,
    //   },
    //   where: and(
    //     gte(disclosures.appointmentDate, dto.fromDate),
    //     lte(disclosures.appointmentDate, dto.toDate),
    //     dto.scoutId ? eq(disclosures.scoutId, dto.scoutId) : undefined,
    //     dto.uncompletedOnly
    //       ? eq(disclosures.isAppointmentCompleted, false)
    //       : undefined,
    //   ),
    // });
  }

  async getDateAppointments({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...dto
  }: TGetDateAppointmentsDto) {
    return await this.db.query.disclosures.findMany({
      columns: {
        id: true,
        appointmentDate: true,
        isAppointmentCompleted: true,
        patientId: true,
      },
      where: and(
        eq(disclosures.appointmentDate, dto.date),
        dto.scoutId ? eq(disclosures.scoutId, dto.scoutId) : undefined,
        dto.uncompletedOnly
          ? eq(disclosures.isAppointmentCompleted, false)
          : undefined,
      ),
      limit: pageSize,
      with: {
        patient: ACTIONER_WITH,
      },
    });
  }

  async getLastDisclosureByPatientId(patientId: string) {
    return await this.db.query.disclosures.findFirst({
      with: {
        createdBy: ACTIONER_WITH,
        priority: true,
        rating: true,
        scout: ACTIONER_WITH,
        updatedBy: ACTIONER_WITH,
      },
      where: eq(disclosures.patientId, patientId),
      orderBy: desc(disclosures.createdAt),
    });
  }

  async addDisclosureDetails(dto: TAddDisclosureDetailsDto) {
    await this.db.insert(disclosureDetails).values(dto);
  }

  async updateDisclosureDetails(
    dto: TUpdateDisclosureDetailsDto,
    tx?: TDbContext,
  ) {
    return await (tx || this.db).update(disclosureDetails).set(dto).returning();
  }

  async getDisclosureDetails(disclosureId: string) {
    return await this.db.query.disclosureDetails.findFirst({
      where: eq(disclosureDetails.disclosureId, disclosureId),
      with: { createdBy: ACTIONER_WITH, updatedBy: ACTIONER_WITH },
    });
  }
}
