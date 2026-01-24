import { inject, injectable } from "inversify";
import "reflect-metadata";
import { NotificationRepo } from "../repos/notification.repo";
import {
  TAddNotificationDto,
  TFilterNotificationsDto,
} from "../types/notification.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";
import { TDbContext } from "../db/drizzle";
import { employees } from "../db/schema";
import { inArray } from "drizzle-orm";
import { TEmployeeEntity } from "../types/employee.type";

type NotificationType =
  | "consultation_requested"
  | "consultation_completed"
  | "disclosure_assigned";

@injectable()
export class NotificationService {
  constructor(
    @inject(NotificationRepo) private notificationRepo: NotificationRepo,
    @inject("db") private db: TDbContext,
  ) {}

  async createNotification(dto: TAddNotificationDto[], tx?: TDbContext) {
    return this.notificationRepo.create(dto, tx);
  }

  async getNotificationsForEmployee(
    employeeId: string,
    dto: TFilterNotificationsDto,
  ) {
    return this.notificationRepo.findManyWithIncludesPaginated({
      ...dto,
      to: employeeId,
    });
  }

  async getUnreadCount(employeeId: string) {
    return this.notificationRepo.getUnreadCount(employeeId);
  }

  async getNotificationById(id: string) {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return notification;
  }

  async sendNotification(dto: TAddNotificationDto[], tx?: TDbContext) {
    await this.createNotification(dto, tx);
  }

  async sendNotificationToMultiple(dto: {
    fromId: string;
    toIds: string[];
    type: NotificationType;
    text?: string;
    recordId?: string;
    tx?: TDbContext;
  }) {
    if (dto.toIds.length === 0) return;

    const notifications: TAddNotificationDto[] = dto.toIds.map((toId) => ({
      from: dto.fromId,
      to: toId,
      type: dto.type,
      text: dto.text,
      recordId: dto.recordId,
    }));

    // Use bulk insert for better performance
    await this.createNotification(notifications, dto.tx);
  }

  async sendBulkNotifications(
    notifications: TAddNotificationDto[],
    tx?: TDbContext,
  ) {
    if (notifications.length === 0) return;
    await this.createNotification(notifications, tx);
  }

  async sendNotificationToRoles(
    dto: Omit<TAddNotificationDto, "to"> & { roles: TEmployeeEntity["role"][] },
    tx?: TDbContext,
  ) {
    const employeesInRoles = await this.db
      .select({ id: employees.id })
      .from(employees)
      .where(inArray(employees.role, dto.roles));

    const employeeIds = employeesInRoles.map((e) => e.id);

    if (employeeIds.length > 0) {
      await this.createNotification(
        employeeIds.map((id) => ({
          ...dto,
          to: id,
        })),
        tx,
      );
    }
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

    await this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
  }

  async deleteReadNotifications(userId: string) {
    await this.notificationRepo.deleteReadNotifications(userId);
  }
}
