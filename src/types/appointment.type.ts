import { Static } from "elysia";

import { TCreatedBy, TUpdatedBy } from "./common.types";
import {
  addAppointmentModel,
  appointmentSelectModel,
  filterAppointmentsModel,
  updateAppointmentModel,
} from "../models/appointment.model";

export type TFilterAppointmentsDto = Static<typeof filterAppointmentsModel>;

export type TAppointment = Static<typeof appointmentSelectModel>;

export type TAddAppointmentDto = Static<typeof addAppointmentModel> &
  TCreatedBy;

export type TUpdateAppointmentDto = Static<typeof updateAppointmentModel> &
  TUpdatedBy;
