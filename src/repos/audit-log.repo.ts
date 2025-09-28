import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import {
  and,
  count,
  desc,
  eq,
  inArray,
  InferInsertModel,
  or,
  sql,
} from "drizzle-orm";
import {
  auditLogs,
  disclosures,
  disclosuresToRatings,
  employees,
  priorityDegrees,
  ratings,
} from "../db/schema";
import { TGetDisclosureAuditLogsDto } from "../types/disclosure.type";
import {
  ACTIONER_WITH,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../constants/constants";

@injectable()
export class AuditLogRepo {
  constructor(@inject("db") private db: TDbContext) {}

  async create(
    audits: InferInsertModel<typeof auditLogs>[],
    tx?: TDbContext,
  ): Promise<void> {
    await (tx ?? this.db).insert(auditLogs).values(audits);
  }

  private getDisclosureAuditLogFilters(disclosureId: string, date?: string) {
    const dateFilter = date ? eq(auditLogs.createdAt, date) : undefined;
    return and(
      or(
        and(
          eq(auditLogs.table, "disclosures"),
          eq(auditLogs.recordId, disclosureId),
        ),
        and(
          eq(auditLogs.table, "disclosure_notes"),
          inArray(
            auditLogs.recordId,
            sql`(SELECT id FROM disclosure_notes WHERE disclosure_id = ${disclosureId})`,
          ),
        ),
        and(
          eq(auditLogs.table, "disclosures_to_ratings"),
          inArray(
            auditLogs.recordId,
            sql`(SELECT id FROM disclosures_to_ratings WHERE disclosure_id = ${disclosureId})`,
          ),
        ),
        and(
          eq(auditLogs.table, "visits"),
          inArray(
            auditLogs.recordId,
            sql`(SELECT id FROM visits WHERE disclosure_id = ${disclosureId})`,
          ),
        ),
      ),
      dateFilter,
    );
  }

  private async getDisclosureAuditLogTotalCount({
    disclosureId,
  }: TGetDisclosureAuditLogsDto) {
    const auditLogFilters = this.getDisclosureAuditLogFilters(disclosureId);
    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(auditLogs)
      .where(auditLogFilters);

    return totalCount;
  }
  async getDisclosureAuditLogsGroupedByDatePaginated(
    dto: TGetDisclosureAuditLogsDto,
  ) {
    const {
      disclosureId,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
    } = dto;

    const totalCount = await this.getDisclosureAuditLogTotalCount(dto);

    const auditRecords = await this.db
      .select({
        createdAt: auditLogs.createdAt,
        logs: sql`json_agg(${auditLogs} ORDER BY ${auditLogs.id})`.as("logs"),
      })
      .from(auditLogs)
      .where(this.getDisclosureAuditLogFilters(disclosureId))
      .groupBy(auditLogs.createdAt)
      .orderBy(desc(auditLogs.createdAt))
      .offset(pageSize * pageNumber)
      .limit(pageSize);

    return { items: auditRecords, totalCount, pageSize, pageNumber };
  }

  async getDisclosureAuditLogByDateWithIncludes(
    disclosureId: string,
    date: string,
  ) {
    const res = await this.db
      .select()
      .from(auditLogs)
      .where(this.getDisclosureAuditLogFilters(disclosureId, date));

    const mappedResult = res.map(async (auditRecord) => {
      let oldRecordValue: any = null;
      let newRecordValue: any = null;
      switch (auditRecord.table) {
        case "visits":
        case "disclosure_notes": {
          return { ...auditRecord, oldRecordValue, newRecordValue };
        }
        case "disclosures": {
          switch (auditRecord.column) {
            case disclosures.status.name: {
              break;
            }
            case disclosures.scoutId.name: {
              oldRecordValue = await this.db.query.employees.findFirst({
                where: eq(employees.id, auditRecord.oldValue!),
                columns: ACTIONER_WITH.columns,
              });
              newRecordValue = await this.db.query.employees.findFirst({
                where: eq(employees.id, auditRecord.newValue!),
                columns: ACTIONER_WITH.columns,
              });
              break;
            }
            case disclosures.priorityId.name: {
              oldRecordValue = await this.db.query.priorityDegrees.findFirst({
                where: eq(priorityDegrees.id, auditRecord.oldValue!),
                columns: ACTIONER_WITH.columns,
              });
              newRecordValue = await this.db.query.priorityDegrees.findFirst({
                where: eq(priorityDegrees.id, auditRecord.newValue!),
                columns: ACTIONER_WITH.columns,
              });
              break;
            }
          }
          break;
        }
        case "disclosures_to_ratings": {
          switch (auditRecord.column) {
            case disclosuresToRatings.note.name:
            case disclosuresToRatings.isCustom.name:
            case disclosuresToRatings.customRating.name: {
              break;
            }

            case disclosuresToRatings.ratingId.name: {
              oldRecordValue = await this.db.query.ratings.findFirst({
                where: eq(ratings.id, auditRecord.oldValue!),
                columns: ACTIONER_WITH.columns,
              });
              newRecordValue = await this.db.query.ratings.findFirst({
                where: eq(ratings.id, auditRecord.newValue!),
                columns: ACTIONER_WITH.columns,
              });
              break;
            }
          }
          break;
        }

        default:
          break;
      }
      return { ...auditRecord, newRecordValue, oldRecordValue };
    });

    return await Promise.all(mappedResult);
  }
}
