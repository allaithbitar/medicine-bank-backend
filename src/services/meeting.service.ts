import "reflect-metadata";
import { inject, injectable } from "inversify";
import { MeetingRepo } from "../repos/meeting.repo";
import {
  TAddMeetingDto,
  TFilterMeetingsDto,
  TUpdateMeetingDto,
} from "../types/meeting.type";
import { SystemBroadcastService } from "./system-broadcast.service";

@injectable()
export class MeetingService {
  constructor(
    @inject(MeetingRepo) private meetingRepo: MeetingRepo,
    @inject(SystemBroadcastService)
    private systemBroadcastService: SystemBroadcastService,
  ) {}

  getMeetings(dto: TFilterMeetingsDto) {
    return this.meetingRepo.findManyPaginated(dto);
  }

  async addMeeting(dto: TAddMeetingDto) {
    const meeting = await this.meetingRepo.create(dto);
    if (meeting) {
      await this.systemBroadcastService.addSystemBroadcast({
        type: "meeting",
        audience: "all",
      });
    }
  }

  async updateMeeting(dto: TUpdateMeetingDto) {
    await this.meetingRepo.update(dto);
  }
}
