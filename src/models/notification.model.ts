import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { notifications } from "../db/schema";
import { paginationModel } from "./common.model";

export const notificationSelectModel = createSelectSchema(notifications);

export const notificationInsertModel = createInsertSchema(notifications);

export const addNotificationModel = t.Composite([
  t.Omit(notificationInsertModel, ["id"]),
]);

export const filterNotificationsModel = t.Partial(
  t.Composite([
    paginationModel,
    t.Object({
      type: notificationInsertModel.properties.type,
      isRead: t.Boolean(),
      from: t.String({ format: "uuid" }),
      to: t.String({ format: "uuid" }),
    }),
  ]),
);

export const markAsReadModel = t.Object({
  id: t.String({ format: "uuid" }),
});

