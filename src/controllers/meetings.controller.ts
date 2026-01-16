import Elysia, { t } from "elysia";
import {
  addMeetingModel,
  filterMeetingsModel,
  meetingSelectModel,
  updateMeetingModel,
} from "../models/meeting.model";
import DiContainer from "../di/di-container";
import { MeetingService } from "../services/meeting.service";
import { AuthGuard } from "../guards/auth.guard";

export const MeetingsController = new Elysia({
  name: "Meetings.Controller",
  tags: ["Meetings"],
}).group("/meetings", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      meetingService: DiContainer.get(MeetingService),
    }))
    .get("", ({ meetingService, query }) => meetingService.getMeetings(query), {
      query: filterMeetingsModel,
    })
    .get(
      ":id",
      ({ meetingService, params }) => meetingService.getMeeting(params.id),
      {
        params: t.Pick(meetingSelectModel, ["id"]),
      },
    )
    .post("", ({ body, meetingService }) => meetingService.addMeeting(body), {
      body: addMeetingModel,
    })
    .put("", ({ body, meetingService }) => meetingService.updateMeeting(body), {
      body: updateMeetingModel,
    }),
);
