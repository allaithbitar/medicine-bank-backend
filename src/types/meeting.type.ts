import { Static } from "elysia";
import {
  addMeetingModel,
  meetingSelectModel,
  filterMeetingsModel,
  updateMeetingModel,
} from "../models/meeting.model";

export type TFilterMeetingsDto = Static<typeof filterMeetingsModel>;
export type TMeeting = Static<typeof meetingSelectModel>;
export type TAddMeetingDto = Static<typeof addMeetingModel>;
export type TUpdateMeetingDto = Static<typeof updateMeetingModel>;
