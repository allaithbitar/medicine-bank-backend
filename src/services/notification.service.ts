import { inject, injectable } from "inversify";
import "reflect-metadata";
import { NotificationRepo } from "../repos/notification.repo";
import {
  TAddNotificationDto,
  TFilterNotificationsDto,
} from "../types/notification.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";
import { TDbContext } from "../db/drizzle";

@injectable()
export class NotificationService {
  constructor(
    @inject(NotificationRepo) private notificationRepo: NotificationRepo,
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

  // async sendNotification(
  //   fromId: string,
  //   toId: string,
  //   type: string,
  //   text?: string,
  //   recordId?: string,
  //   tx: TDbContext,
  // ) {
  //   const notification: TAddNotificationDto = {
  //     from: fromId,
  //     to: toId,
  //     type: type as any,
  //     text,
  //     recordId,
  //   };
  //
  //   await this.createNotification(notification);
  // }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

    await this.notificationRepo.markAsRead(id);
  }
}

