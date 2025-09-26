import { systemBroadcasts } from "../db/schema";
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { paginationModel } from "./common.model";

export const systemBroadcastInsertModel = createInsertSchema(systemBroadcasts);

export const systemBroadcastSelectModel = createSelectSchema(systemBroadcasts);

export const addSystemBroadcastModel = t.Omit(systemBroadcastInsertModel, [
  "id",
  "createdAt",
]);

export const updateSystemBroadcastModel = t.Composite([
  addSystemBroadcastModel,
  t.Required(t.Pick(systemBroadcastInsertModel, ["id"])),
]);

export const filterSystemBroadcastsModel = t.Composite([
  paginationModel,
  t.Partial(t.Pick(systemBroadcastInsertModel, ["type"])),
  t.Partial(
    t.Object({
      audience: t.Array(systemBroadcastInsertModel.properties.audience),
    }),
  ),
]);
