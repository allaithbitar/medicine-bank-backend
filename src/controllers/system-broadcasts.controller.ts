import Elysia from "elysia";
import {
  addSystemBroadcastModel,
  filterSystemBroadcastsModel,
  updateSystemBroadcastModel,
} from "../models/system-broadcast.model";
import DiContainer from "../di/di-container";
import { SystemBroadcastService } from "../services/system-broadcast.service";
import { AuthGuard } from "../guards/auth.guard";

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
