import { inject, injectable } from "inversify";
import {
  TAddNotificationDto,
  TFilterNotificationsDto,
  TNotificationEntity,
} from "../types/notification.type";
import { TDbContext } from "../db/drizzle";
import { notifications } from "../db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

@injectable()
export class NotificationRepo {
  constructor(@inject("db") private db: TDbContext) {}

  async create(createDto: TAddNotificationDto, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db).insert(notifications).values(createDto);
  }

  async findById(id: string): Promise<TNotificationEntity | undefined> {
    return this.db.query.notifications.findFirst({ where: eq(notifications.id, id) });
  }

  async findByEmployeeId(employeeId: string): Promise<TNotificationEntity[]> {
    return this.db.query.notifications.findMany({
      where: eq(notifications.to, employeeId),
      orderBy: desc(notifications.id),
    });
  }

  private async getFilters({ type, isRead, from, to }: TFilterNotificationsDto) {
    const typeFilter = type ? eq(notifications.type, type) : undefined;
    const fromFilter = from ? eq(notifications.from, from) : undefined;
    const toFilter = to ? eq(notifications.to, to) : undefined;

    return {
      typeFilter,
      fromFilter,
      toFilter,
    };
  }

  private async getCount(dto: TFilterNotificationsDto) {
    const { typeFilter, fromFilter, toFilter } = await this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(and(typeFilter, fromFilter, toFilter));

    return totalCount;
  }

  async findManyWithIncludesPaginated({
    pageSize = DEFAULT_PAGE_SIZE,
    pageNumber = DEFAULT_PAGE_NUMBER,
    ...rest
  }: TFilterNotificationsDto) {
    const count = await this.getCount(rest);
    const { typeFilter, fromFilter, toFilter } = await this.getFilters(rest);

    const result = await this.db.query.notifications.findMany({
      where: and(typeFilter, fromFilter, toFilter),
      with: {
        fromEmployee: {
          columns: { id: true, name: true },
        },
        toEmployee: {
          columns: { id: true, name: true },
        },
      },
      limit: pageSize,
      offset: pageSize * pageNumber,
      orderBy: desc(notifications.id),
    });

    return {
      items: result,
      count,
      pageSize,
      pageNumber,
    };
  }

  async findUnreadByEmployeeId(employeeId: string): Promise<TNotificationEntity[]> {
    return this.db.query.notifications.findMany({
      where: eq(notifications.to, employeeId),
      orderBy: desc(notifications.id),
    });
  }

  async getUnreadCount(employeeId: string): Promise<number> {
    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.to, employeeId), eq(notifications.readAt, null)));

    return totalCount;
  }

  async markAsRead(id: string, tx?: TDbContext): Promise<void> {
    await (tx ?? this.db)
      .update(notifications)
      .set({ readAt: new Date().toISOString() })
      .where(eq(notifications.id, id));
  }
}