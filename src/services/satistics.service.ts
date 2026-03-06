import "reflect-metadata";
import { inject, injectable } from "inversify";
import {
  TGetHalfDetailedSatisticsByAreaDto,
  TGetSatisticsDto,
} from "../types/satistics.type";
import { TDbContext } from "../db/drizzle";
import {
  and,
  count,
  eq,
  gte,
  lte,
  countDistinct,
  isNull,
  sql,
  or,
  isNotNull,
  gt,
  inArray,
} from "drizzle-orm";
import {
  auditLogs,
  disclosures,
  patients,
  areas,
  payments,
  priorityDegrees,
  ratings,
} from "../db/schema";
import { PAYMENTS_START_DATE } from "../constants/constants";

@injectable()
export class SatisticsService {
  constructor(@inject("db") private db: TDbContext) {}

  // Helper: format grouped rows returned from DB into desired shape
  private formatTypePriority(
    rows: {
      type: string;
      priorityid: string | null;
      priorityname: string | null;
      cnt: string | number;
    }[],
  ) {
    // const types: TDisclosure["type"][] = ["new", "return", "help"];
    const details: Record<string, any> = {};
    // for (const t of types) details[t] = { count: 0, details: [] };

    for (const r of rows as any[]) {
      const t = r.type as string;
      const entry = {
        key: r.priorityname ?? r.priorityName ?? null,
        count: Number(r.cnt),
      };
      if (!details[t]) details[t] = { count: 0, details: [] };
      details[t].count += Number(r.cnt);
      details[t].details.push(entry);
    }

    return details;
  }

  // Helper: group by disclosures table
  private async groupFromDisclosures(whereClause: any) {
    const rows = await this.db
      .select({
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: count(),
      })
      .from(disclosures)
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(whereClause)
      .groupBy(disclosures.type, disclosures.priorityId, priorityDegrees.name);

    return rows as any[];
  }

  // Helper: group by auditLogs (distinct records) joined to disclosures
  private async groupFromAuditLogs(auditWhere: any) {
    const rows = await this.db
      .select({
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: countDistinct(auditLogs.recordId),
      })
      .from(auditLogs)
      .leftJoin(disclosures, eq(auditLogs.recordId, disclosures.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(auditWhere)
      .groupBy(disclosures.type, disclosures.priorityId, priorityDegrees.name);

    return rows as any[];
  }

  // New: half-detailed grouped by area (optimized: few queries grouped by area/type/priority)
  async getHalfDetailedByArea(dto: TGetHalfDetailedSatisticsByAreaDto) {
    const { fromDate, toDate, employeeId, areaIds } = dto ?? {};

    const areasFilter = areaIds?.length
      ? inArray(areas.id, areaIds)
      : undefined;

    const areasList = await this.db
      .select({ id: areas.id, name: areas.name })
      .from(areas)
      .where(areasFilter);

    // helper to format rows that include area (keyed by areaId)
    const formatAreaTypePriority = (rows: any[]) => {
      const map: Record<string, { name: string; types: Record<string, any> }> =
        {};
      for (const r of rows) {
        const areaId = r.areaId as string;
        const areaName = r.areaName as string;
        if (!map[areaId]) map[areaId] = { name: areaName, types: {} };
        const t = r.type as string;
        const entry = { key: r.priorityname ?? null, count: Number(r.cnt) };
        if (!map[areaId].types[t])
          map[areaId].types[t] = { count: 0, details: [] };
        map[areaId].types[t].count += Number(r.cnt);
        map[areaId].types[t].details.push(entry);
      }
      return map;
    };

    // build base joins: disclosures -> patients -> areas -> priorityDegrees
    // 1) added disclosures
    const addedFilters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.createdBy, employeeId) : undefined,
    ];
    const addedWhere = and(...addedFilters);

    const addedRows = await this.db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: count(),
      })
      .from(disclosures)
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(areas, eq(patients.areaId, areas.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(addedWhere)
      .groupBy(
        areas.id,
        areas.name,
        disclosures.type,
        disclosures.priorityId,
        priorityDegrees.name,
      );

    // 2) uncompleted visits
    const uncompletedFilters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
      isNull(disclosures.visitResult),
    ];
    const uncompletedWhere = and(...uncompletedFilters);
    const uncompletedRows = await this.db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: count(),
      })
      .from(disclosures)
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(areas, eq(patients.areaId, areas.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(uncompletedWhere)
      .groupBy(
        areas.id,
        areas.name,
        disclosures.type,
        disclosures.priorityId,
        priorityDegrees.name,
      );

    // 3) completed visits (audit logs)
    const completedAuditFilters = [
      fromDate ? gte(auditLogs.createdAt, fromDate) : undefined,
      toDate ? lte(auditLogs.createdAt, toDate) : undefined,
      eq(auditLogs.table, "disclosures"),
      eq(auditLogs.column, disclosures.visitResult.name),
      sql`${auditLogs.newValue} = 'completed'`,
      employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
    ];
    const completedAuditWhere = and(...completedAuditFilters);
    const completedRows = await this.db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: countDistinct(auditLogs.recordId),
      })
      .from(auditLogs)
      .leftJoin(disclosures, eq(auditLogs.recordId, disclosures.id))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(areas, eq(patients.areaId, areas.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(completedAuditWhere)
      .groupBy(
        areas.id,
        areas.name,
        disclosures.type,
        disclosures.priorityId,
        priorityDegrees.name,
      );

    // 4) cant_be_completed visits (audit logs)
    const cantAuditFilters = [
      fromDate ? gte(auditLogs.createdAt, fromDate) : undefined,
      toDate ? lte(auditLogs.createdAt, toDate) : undefined,
      eq(auditLogs.table, "disclosures"),
      eq(auditLogs.column, disclosures.visitResult.name),
      sql`${auditLogs.newValue} = 'cant_be_completed'`,
      employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
    ];
    const cantAuditWhere = and(...cantAuditFilters);
    const cantRows = await this.db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: countDistinct(auditLogs.recordId),
      })
      .from(auditLogs)
      .leftJoin(disclosures, eq(auditLogs.recordId, disclosures.id))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(areas, eq(patients.areaId, areas.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(cantAuditWhere)
      .groupBy(
        areas.id,
        areas.name,
        disclosures.type,
        disclosures.priorityId,
        priorityDegrees.name,
      );

    // 5) late disclosures
    const priorityDegress = await this.db.query.priorityDegrees.findMany({
      where: isNotNull(priorityDegrees.durationInDays),
    });
    const pdQuery = priorityDegress.map((pd) =>
      and(
        sql`${disclosures.createdAt} <= NOW() - INTERVAL '${sql.raw(String(pd.durationInDays!))} days'`,
        eq(disclosures.priorityId, pd.id),
      ),
    );

    const lateFilters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
      or(...pdQuery),
      eq(disclosures.status, "active"),
      isNull(disclosures.visitResult),
      and(isNull(disclosures.ratingId), isNull(disclosures.customRating)),
    ];
    const lateWhere = and(...lateFilters);
    const lateRows = await this.db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        type: disclosures.type,
        priorityid: disclosures.priorityId,
        priorityname: priorityDegrees.name,
        cnt: count(),
      })
      .from(disclosures)
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(areas, eq(patients.areaId, areas.id))
      .leftJoin(priorityDegrees, eq(disclosures.priorityId, priorityDegrees.id))
      .where(lateWhere)
      .groupBy(
        areas.id,
        areas.name,
        disclosures.type,
        disclosures.priorityId,
        priorityDegrees.name,
      );

    // Format per-area maps
    const addedMap = formatAreaTypePriority(addedRows as any[]);
    const uncompletedMap = formatAreaTypePriority(uncompletedRows as any[]);
    const completedMap = formatAreaTypePriority(completedRows as any[]);
    const cantMap = formatAreaTypePriority(cantRows as any[]);
    const lateMap = formatAreaTypePriority(lateRows as any[]);

    const resultArray: Array<any> = [];
    const sumCount = (m: Record<string, any>) =>
      Object.values(m).reduce((s: number, v: any) => s + (v.count ?? 0), 0);

    for (const a of areasList) {
      const id = a.id as string;
      const name = a.name as string;
      const addedDetails = addedMap[id]?.types ?? {};
      const uncompletedDetails = uncompletedMap[id]?.types ?? {};
      const completedDetails = completedMap[id]?.types ?? {};
      const cantDetails = cantMap[id]?.types ?? {};
      const lateDetails = lateMap[id]?.types ?? {};

      const addedCount = sumCount(addedDetails);
      const uncompletedCount = sumCount(uncompletedDetails);
      const completedCount = sumCount(completedDetails);
      const cantCount = sumCount(cantDetails);
      const lateCount = sumCount(lateDetails);

      const total =
        addedCount + uncompletedCount + completedCount + cantCount + lateCount;
      if (total === 0) continue; // skip empty areas

      resultArray.push({
        areaId: id,
        areaName: name,
        count: total,
        details: {
          addedDisclosures: { count: addedCount, details: addedDetails },
          uncompletedVisits: {
            count: uncompletedCount,
            details: uncompletedDetails,
          },
          completedVisits: { count: completedCount, details: completedDetails },
          cantBeCompletedVisits: { count: cantCount, details: cantDetails },
          lateDisclosures: { count: lateCount, details: lateDetails },
        },
      });
    }

    return resultArray;
  }

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

    let [{ count: paymentEligibleDisclosuresCount }] = await this.db
      .select({ count: countDistinct(disclosures.id) })
      .from(disclosures)
      .leftJoin(payments, eq(disclosures.id, payments.disclosureId))
      .leftJoin(auditLogs, eq(disclosures.id, auditLogs.recordId))
      .where(
        and(
          employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
          eq(disclosures.visitResult, "completed"),
          or(
            and(
              isNotNull(disclosures.ratingId),
              eq(disclosures.isCustomRating, false),
            ),
            and(
              isNull(disclosures.ratingId),
              eq(disclosures.isCustomRating, true),
              isNotNull(disclosures.customRating),
            ),
          ),
          gt(disclosures.createdAt, PAYMENTS_START_DATE),
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          sql`${payments.disclosureId} IS NULL`,
          and(
            sql`${auditLogs.recordId} = ${disclosures.id}`,
            or(
              and(
                sql`${auditLogs.column} = ${disclosures.ratingId.name}`,
                sql`${auditLogs.newValue} IS NOT NULL`,
              ),
              and(
                sql`${auditLogs.column} = ${disclosures.isCustomRating.name}`,
                sql`${auditLogs.newValue} IS NOT NULL`,
              ),
              and(
                sql`${auditLogs.column} = ${disclosures.customRating.name}`,
                sql`${auditLogs.newValue} IS NOT NULL`,
              ),
            ),
          ),
        ),
      );

    let [{ count: uncompletedVisitsCount }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(
        and(
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
          isNull(disclosures.visitResult),
        ),
      );

    let priorityDegress = await this.db.query.priorityDegrees.findMany({
      where: isNotNull(priorityDegrees.durationInDays),
    });

    let pdQuery = priorityDegress.map((pd) =>
      and(
        sql`${disclosures.createdAt} <= NOW() - INTERVAL '${sql.raw(String(pd.durationInDays!))} days'`,
        eq(disclosures.priorityId, pd.id),
      ),
    );

    let [{ count: lateDisclosuresCount }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(
        and(
          gte(disclosures.createdAt, fromDate),
          lte(disclosures.createdAt, toDate),
          employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
          or(...pdQuery),
          eq(disclosures.status, "active"),
          isNull(disclosures.visitResult),
          and(isNull(disclosures.ratingId), isNull(disclosures.customRating)),
        ),
      );

    return {
      addedDisclosuresCount,
      uncompletedVisitsCount,
      completedVisitsCount,
      cantBeCompletedVisitsCount,
      lateDisclosuresCount,
      paymentEligibleDisclosuresCount,
    };
  }

  /**
   * Returns added disclosures counts grouped by type and priority (urgency).
   * Example:
   * {
   *   addedDisclosuresCount: 20,
   *   details: {
   *     new: { count: 10, details: [{ priorityId, priorityDegree, count }] },
   *     return: { ... },
   *     help: { ... }
   *   }
   * }
   */
  async getAddedDisclosuresSummary(dto: Partial<TGetSatisticsDto> = {}) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    const filters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.createdBy, employeeId) : undefined,
    ];

    const whereClause = and(...filters);

    const [{ count: addedDisclosuresCount }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(whereClause);

    const rows = await this.groupFromDisclosures(whereClause);
    const details = this.formatTypePriority(rows as any[]);

    return {
      count: Number(addedDisclosuresCount ?? 0),
      details,
    };
  }

  async getUncompletedVisitsSummary(dto: Partial<TGetSatisticsDto> = {}) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    const filters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
      isNull(disclosures.visitResult),
    ];

    const whereClause = and(...filters);

    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(whereClause);

    const rows = await this.groupFromDisclosures(whereClause);
    const details = this.formatTypePriority(rows as any[]);

    return { count: Number(total ?? 0), details };
  }

  async getCompletedVisitsSummary(dto: Partial<TGetSatisticsDto> = {}) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    const auditFilters = [
      fromDate ? gte(auditLogs.createdAt, fromDate) : undefined,
      toDate ? lte(auditLogs.createdAt, toDate) : undefined,
      eq(auditLogs.table, "disclosures"),
      eq(auditLogs.column, disclosures.visitResult.name),
      sql`${auditLogs.newValue} = 'completed'`,
      employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
    ];

    const [{ count: total }] = await this.db
      .select({ count: countDistinct(auditLogs.recordId) })
      .from(auditLogs)
      .where(and(...auditFilters));

    const rows = await this.groupFromAuditLogs(and(...auditFilters));
    const details = this.formatTypePriority(rows as any[]);

    return { count: Number(total ?? 0), details };
  }

  async getCantBeCompletedVisitsSummary(dto: Partial<TGetSatisticsDto> = {}) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    const auditFilters = [
      fromDate ? gte(auditLogs.createdAt, fromDate) : undefined,
      toDate ? lte(auditLogs.createdAt, toDate) : undefined,
      eq(auditLogs.table, "disclosures"),
      eq(auditLogs.column, disclosures.visitResult.name),
      sql`${auditLogs.newValue} = 'cant_be_completed'`,
      employeeId ? eq(auditLogs.createdBy, employeeId) : undefined,
    ];

    const [{ count: total }] = await this.db
      .select({ count: countDistinct(auditLogs.recordId) })
      .from(auditLogs)
      .where(and(...auditFilters));

    const rows = await this.groupFromAuditLogs(and(...auditFilters));
    const details = this.formatTypePriority(rows as any[]);

    return { count: Number(total ?? 0), details };
  }

  async getLateDisclosuresSummary(dto: Partial<TGetSatisticsDto> = {}) {
    const { fromDate, toDate, employeeId } = dto ?? {};

    const priorityDegress = await this.db.query.priorityDegrees.findMany({
      where: isNotNull(priorityDegrees.durationInDays),
    });

    const pdQuery = priorityDegress.map((pd) =>
      and(
        sql`${disclosures.createdAt} <= NOW() - INTERVAL '${sql.raw(String(pd.durationInDays!))} days'`,
        eq(disclosures.priorityId, pd.id),
      ),
    );

    const filters = [
      fromDate ? gte(disclosures.createdAt, fromDate) : undefined,
      toDate ? lte(disclosures.createdAt, toDate) : undefined,
      employeeId ? eq(disclosures.scoutId, employeeId) : undefined,
      or(...pdQuery),
      eq(disclosures.status, "active"),
      isNull(disclosures.visitResult),
      and(isNull(disclosures.ratingId), isNull(disclosures.customRating)),
    ];

    const whereClause = and(...filters);

    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(disclosures)
      .where(whereClause);

    const rows = await this.groupFromDisclosures(whereClause);
    const details = this.formatTypePriority(rows as any[]);

    return { count: Number(total ?? 0), details };
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
