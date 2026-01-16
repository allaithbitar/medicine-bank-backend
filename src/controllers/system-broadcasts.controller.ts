import Elysia, { t } from "elysia";
import {
  addSystemBroadcastModel,
  filterSystemBroadcastsModel,
  systemBroadcastSelectModel,
  updateSystemBroadcastModel,
} from "../models/system-broadcast.model";
import DiContainer from "../di/di-container";
import { SystemBroadcastService } from "../services/system-broadcast.service";

export const SystemBroadcastsController = new Elysia({
  name: "SystemBroadcasts.Controller",
  tags: ["System Broadcasts"],
}).group("/system-broadcasts", (app) =>
  app
    // .use(AuthGuard)
    .resolve(() => ({
      systemBroadcastService: DiContainer.get(SystemBroadcastService),
    }))
    .post(
      "search",
      ({ systemBroadcastService, body }) =>
        systemBroadcastService.getSystemBroadcasts(body),
      {
        body: filterSystemBroadcastsModel,
      },
    )
    .get(
      ":id",
      ({ systemBroadcastService, params }) =>
        systemBroadcastService.getSystemBroadcast(params.id),
      {
        params: t.Pick(systemBroadcastSelectModel, ["id"]),
      },
    )

    .post(
      "",
      ({ body, systemBroadcastService }) =>
        systemBroadcastService.addSystemBroadcast(body),
      {
        body: addSystemBroadcastModel,
      },
    )
    .put(
      "",
      ({ body, systemBroadcastService }) =>
        systemBroadcastService.updateSystemBroadcast(body),
      {
        body: updateSystemBroadcastModel,
      },
    ),
);
