import { meetings } from "../db/schema";
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { paginationModel } from "./common.model";

export const meetingInsertModel = createInsertSchema(meetings);
export const meetingSelectModel = createSelectSchema(meetings);

export const addMeetingModel = t.Omit(meetingInsertModel, ["id"]);

export const updateMeetingModel = t.Composite([
  addMeetingModel,
  t.Required(t.Pick(meetingInsertModel, ["id"])),
]);

export const filterMeetingsModel = t.Composite([paginationModel]);
