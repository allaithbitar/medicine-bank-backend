import "reflect-metadata";

import { AppointmentRepo } from "../repos/appointment.repo";
import {
  TAddAppointmentDto,
  TFilterAppointmentsDto,
  TUpdateAppointmentDto,
} from "../types/appointment.type";
import { inject, injectable } from "inversify";

@injectable()
export class AppointmentService {
  constructor(
    @inject(AppointmentRepo) private appointmentRepo: AppointmentRepo,
  ) {}

  getAppointmentsInTimePeriod(dto: TFilterAppointmentsDto) {
    return this.appointmentRepo.findManyInTimePeriod(dto);
  }

  async getByDisclosureId(disclosureId: string) {
    return this.appointmentRepo.findManyDisclosureAppointsmentsWithIncludes(
      disclosureId,
    );
  }

  async getByDate(date: string) {
    return this.appointmentRepo.findManyByDateWithIncludes(date);
  }

  async addAppointment(dto: TAddAppointmentDto) {
    await this.appointmentRepo.create(dto);
  }

  async updateAppointment(dto: TUpdateAppointmentDto) {
    await this.appointmentRepo.update(dto);
  }
}
