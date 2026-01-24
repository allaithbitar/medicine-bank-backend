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
import { eq, inArray } from "drizzle-orm";
import { TEmployeeEntity } from "../types/employee.type";

@injectable()
export class NotificationService {
  constructor(
    @inject(NotificationRepo) private notificationRepo: NotificationRepo,
    @inject("db") private db: TDbContext,
  ) {}

  async createNotification(dto: TAddNotificationDto, tx?: TDbContext) {
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

  async sendNotification(
    fromId: string,
    toId: string,
    type: "consultation_requested" | "consultation_completed",
    text?: string,
    recordId?: string,
    tx?: TDbContext,
  ) {
    const notification: TAddNotificationDto = {
      from: fromId,
      to: toId,
      type: type as any,
      text,
      recordId,
    };

    await this.createNotification(notification, tx);
  }

  async sendNotificationToMultiple(dto: {
    fromId: string;
    toIds: string[];
    type: "consultation_requested" | "consultation_completed";
    text?: string;
    recordId?: string;
    tx?: TDbContext;
  }) {
    const notifications: TAddNotificationDto[] = dto.toIds.map((toId) => ({
      from: dto.fromId,
      to: toId,
      type: dto.type,
      text: dto.text,
      recordId: dto.recordId,
    }));

    // Create all notifications in batch
    for (const notification of notifications) {
      await this.createNotification(notification, dto.tx);
    }
  }

  async sendNotificationToRoles(dto: {
    roles: TEmployeeEntity["role"][];
    fromId: string;
    type: "consultation_requested" | "consultation_completed";
    recordId?: string;
    text?: string;
    tx?: TDbContext;
  }) {
    // Fetch all managers
    const managers = await this.db
      .select({ id: employees.id })
      .from(employees)
      .where(inArray(employees.role, dto.roles));

    const roleIds = managers.map((m) => m.id);

    if (roleIds.length > 0) {
      await this.sendNotificationToMultiple({
        fromId: dto.fromId,
        toIds: roleIds,
        type: dto.type,
        recordId: dto.recordId,
        text: dto.text,
        tx: dto.tx,
      });
    }
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

    await this.notificationRepo.markAsRead(id);
  }
}
