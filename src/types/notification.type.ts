import { InferSelectModel } from "drizzle-orm";
import { notifications } from "../db/schema";
import { Static } from "elysia";
import { addNotificationModel, filterNotificationsModel } from "../models/notification.model";

export type TNotificationEntity = InferSelectModel<typeof notifications>;

export type TAddNotificationDto = Static<typeof addNotificationModel>;

export type TFilterNotificationsDto = Static<typeof filterNotificationsModel>;

export type TNotificationResponseDto = TNotificationEntity & {
  fromEmployee?: {
    id: string;
    name: string;
  };
  toEmployee?: {
    id: string;
    name: string;
  };
};

export type TMarkAsReadDto = {
  id: string;
};