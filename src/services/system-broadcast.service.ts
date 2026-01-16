import "reflect-metadata";
import { inject, injectable } from "inversify";
import { SystemBroadcastRepo } from "../repos/system-broadcast.repo";
import {
  TAddSystemBroadcastDto,
  TFilterSystemBroadcastsDto,
  TUpdateSystemBroadcastDto,
} from "../types/system-broadcast.type";

@injectable()
export class SystemBroadcastService {
  constructor(
    @inject(SystemBroadcastRepo)
    private systemBroadcastRepo: SystemBroadcastRepo,
  ) {}

  getSystemBroadcasts(dto: TFilterSystemBroadcastsDto) {
    return this.systemBroadcastRepo.findManyPaginated(dto);
  }

  getSystemBroadcast(id: string) {
    return this.systemBroadcastRepo.findById(id);
  }

  async addSystemBroadcast(dto: TAddSystemBroadcastDto) {
    await this.systemBroadcastRepo.create(dto);
  }

  async updateSystemBroadcast(dto: TUpdateSystemBroadcastDto) {
    await this.systemBroadcastRepo.update(dto);
  }
}
