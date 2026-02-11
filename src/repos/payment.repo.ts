const PAYMENTS_START_DATE = "2026-02-01";

import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import {
  and,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  auditLogs,
  disclosures,
  employees,
  patients,
  payments,
  ratings,
} from "../db/schema";
import {
  TAddPaymentDto,
  TFilterPaymentsDto,
  TMarkDisclosuresAsPaidDto,
  TUpdatePaymentDto,
} from "../types/payment.type";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

const columns = {
  disclosureId: disclosures.id,
  scout: {
    id: employees.id,
    name: employees.name,
  },
  patient: {
    id: patients.id,
    name: patients.name,
  },
  rating: {
    id: ratings.id,
    name: ratings.name,
    isCustomRating: disclosures.isCustomRating,
    customRating: disclosures.customRating,
    completedAt: auditLogs.createdAt,
  },
  paidAt: payments.createdAt,
} as const;

@injectable()
export class PaymentRepo {
  constructor(@inject("db") private db: TDbContext) {}

  async create(dto: TAddPaymentDto[], tx?: TDbContext) {
    await (tx || this.db).insert(payments).values(dto);
  }

  async update(dto: TUpdatePaymentDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    await (tx || this.db).update(payments).set(rest).where(eq(payments.id, id));
  }

  private getPaymentsFilters({
    dateFrom,
    dateTo,
    scoutIds,
    scoutId,
  }: TFilterPaymentsDto & {
    scoutIds?: string[];
    scoutId?: string;
  }) {
    let scoutFilter;

    if (scoutIds?.length) {
      scoutFilter = inArray(disclosures.scoutId, scoutIds);
    }

    if (scoutId) {
      scoutFilter = eq(disclosures.scoutId, scoutId);
    }

    const dateFromFilter = dateFrom
      ? gte(disclosures.createdAt, dateFrom)
      : undefined;

    const dateToFilter = dateTo
      ? lte(disclosures.createdAt, dateTo)
      : undefined;

    const visitResultFilter = eq(disclosures.visitResult, "completed");
    const ratingFitler = or(
      and(
        isNotNull(disclosures.ratingId),
        eq(disclosures.isCustomRating, false),
      ),
      and(
        isNull(disclosures.ratingId),
        eq(disclosures.isCustomRating, true),
        isNotNull(disclosures.customRating),
      ),
    );

    const paymentStartFilter = gt(disclosures.createdAt, PAYMENTS_START_DATE);

    const hasNoPaymentFilter = sql`${payments.disclosureId} IS NULL`;

    const auditLogsFilters = and(
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
    );
    return {
      scoutFilter,
      dateFromFilter,
      dateToFilter,
      visitResultFilter,
      ratingFitler,
      paymentStartFilter,
      hasNoPaymentFilter,
      auditLogsFilters,
    };
  }

  private async getPaymentsCount(where: any) {
    const [{ value: totalCount }] = await this.db
      .select({ value: countDistinct(disclosures.id) })
      .from(disclosures)
      .leftJoin(payments, eq(disclosures.id, payments.disclosureId))
      .leftJoin(employees, eq(disclosures.scoutId, employees.id))
      .leftJoin(auditLogs, eq(disclosures.id, auditLogs.recordId))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(ratings, eq(disclosures.ratingId, ratings.id))
      .where(where);
    return totalCount;
  }

  async getEligibleDisclosures({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...dto
  }: TFilterPaymentsDto = {}) {
    const filters = this.getPaymentsFilters(dto);

    const where = and(...Object.values(filters));

    const totalCount = await this.getPaymentsCount(where);

    const items = await this.db
      .selectDistinctOn([disclosures.id], { ...columns })
      .from(disclosures)
      .leftJoin(payments, eq(disclosures.id, payments.disclosureId))
      .leftJoin(employees, eq(disclosures.scoutId, employees.id))
      .leftJoin(auditLogs, eq(disclosures.id, auditLogs.recordId))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(ratings, eq(disclosures.ratingId, ratings.id))
      .where(where)
      .limit(pageSize)
      .offset(pageSize * pageNumber)
      .orderBy(disclosures.id, desc(auditLogs.createdAt))
      .execute();

    return {
      items,
      totalCount,
      pageSize,
      pageNumber,
    };
  }

  async markDisclosuresAsPaid(dto: TMarkDisclosuresAsPaidDto) {
    const filters = this.getPaymentsFilters(dto);
    const where = and(...Object.values(filters));

    const disclosureIds = await this.db
      .selectDistinctOn([disclosures.id], { id: disclosures.id })
      .from(disclosures)
      .leftJoin(payments, eq(disclosures.id, payments.disclosureId))
      .leftJoin(employees, eq(disclosures.scoutId, employees.id))
      .leftJoin(auditLogs, eq(disclosures.id, auditLogs.recordId))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(ratings, eq(disclosures.ratingId, ratings.id))
      .where(where)
      .execute();
    if (disclosureIds.length) {
      await this.db.transaction(async (tx) => {
        const dtos = disclosureIds.map((dId) => ({
          disclosureId: dId.id,
          createdBy: dto.createdBy,
        }));
        await this.create(dtos, tx as any);
      });
    }
  }

  async getPaymentsHistory({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...dto
  }: TFilterPaymentsDto) {
    const { hasNoPaymentFilter, ...restFilters } = this.getPaymentsFilters(dto);
    const hasPaymentFilter = sql`(${payments.disclosureId} IS NOT NULL)`;
    const where = and(...Object.values({ ...restFilters, hasPaymentFilter }));
    const totalCount = await this.getPaymentsCount(where);
    const items = await this.db
      .selectDistinctOn([disclosures.id], { ...columns })
      .from(disclosures)
      .leftJoin(payments, eq(disclosures.id, payments.disclosureId))
      .leftJoin(employees, eq(disclosures.scoutId, employees.id))
      .leftJoin(auditLogs, eq(disclosures.id, auditLogs.recordId))
      .leftJoin(patients, eq(disclosures.patientId, patients.id))
      .leftJoin(ratings, eq(disclosures.ratingId, ratings.id))
      .where(where)
      .limit(pageSize)
      .offset(pageSize * pageNumber)
      .orderBy(disclosures.id, desc(payments.createdAt));
    return {
      items,
      totalCount,
      pageSize,
      pageNumber,
    };
  }
}
