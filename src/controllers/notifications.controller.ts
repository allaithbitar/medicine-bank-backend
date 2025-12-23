import { Elysia, t } from "elysia";
import { filterNotificationsModel, markAsReadModel } from "../models/notification.model";
import DiContainer from "../di/di-container";
import { NotificationService } from "../services/notification.service";
import { AuthGuard } from "../guards/auth.guard";

export const NotificationsController = new Elysia({
  name: "Notifications.Controller",
  tags: ["Notifications"],
}).group("/notifications", (app) =>
  app
    .use(AuthGuard)
    .resolve(({ user }) => ({
      notificationService: DiContainer.get(NotificationService),
      currentUserId: user!.id,
    }))
    .get(
      "/search",
      ({ body, notificationService, currentUserId }) =>
        notificationService.getNotificationsForEmployee(currentUserId, body),
      {
        body: filterNotificationsModel,
      },
    )
    .get(
      "/unread-count",
      ({ notificationService, currentUserId }) =>
        notificationService.getUnreadCount(currentUserId),
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
    ),
);