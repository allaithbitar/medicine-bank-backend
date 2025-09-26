import { Static } from "elysia";
import {
  systemBroadcastSelectModel,
  filterSystemBroadcastsModel,
  updateSystemBroadcastModel,
  addSystemBroadcastModel,
} from "../models/system-broadcast.model";

export type TFilterSystemBroadcastsDto = Static<
  typeof filterSystemBroadcastsModel
>;

export type TSystemBroadcast = Static<typeof systemBroadcastSelectModel>;

export type TAddSystemBroadcastDto = Static<typeof addSystemBroadcastModel>;

export type TUpdateSystemBroadcastDto = Static<
  typeof updateSystemBroadcastModel
>;
