import { Elysia, t } from "elysia";
import {
  filterNotificationsModel,
  markAsReadModel,
} from "../models/notification.model";
import DiContainer from "../di/di-container";
import { NotificationService } from "../services/notification.service";
import { AuthGuard } from "../guards/auth.guard";

export const NotificationsController = new Elysia({
  name: "Notifications.Controller",
  tags: ["Notifications"],
}).group("/notifications", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      notificationService: DiContainer.get(NotificationService),
    }))
    .post(
      "/search",
      ({ body, notificationService, user }) =>
        notificationService.getNotificationsForEmployee(user.id, body),
      {
        body: filterNotificationsModel,
      },
    )
    .get("/unread-count", ({ notificationService, user }) =>
      notificationService.getUnreadCount(user.id),
    )
    .get(
      "/:id",
      ({ params, notificationService }) =>
        notificationService.getNotificationById(params.id),
      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )
    .put(
      "/mark-read",
      ({ body, notificationService }) =>
        notificationService.markAsRead(body.id),
      {
        body: markAsReadModel,
      },
    )
    .put("/mark-all-read", ({ notificationService, user }) =>
      notificationService.markAllAsRead(user.id),
    )
    .put("/delete-read", ({ notificationService, user }) =>
      notificationService.deleteReadNotifications(user.id),
    ),
);
