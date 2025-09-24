import Elysia, { t } from "elysia";

import DiContainer from "../di/di-container";

import { AppointmentService } from "../services/appointment.service";
import {
  addAppointmentModel,
  filterAppointmentsModel,
  updateAppointmentModel,
} from "../models/appointment.model";
import { AuthGuard } from "../guards/auth.guard";

export const AppointmentsController = new Elysia({
  name: "Appointments.Controller",
  tags: ["Appointments"],
}).group("/appointments", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      appointmentService: DiContainer.get(AppointmentService),
    }))
    .get(
      "",
      ({ appointmentService, query }) =>
        appointmentService.getAppointmentsInTimePeriod(query),
      {
        query: filterAppointmentsModel,
      },
    )
    .get(
      "date/:date",
      ({ appointmentService, params }) =>
        appointmentService.getByDate(params.date),
      {
        params: t.Object({
          date: t.String({ format: "date" }),
        }),
      },
    )
    .get(
      "disclosure/:disclosureId",
      ({ appointmentService, params }) =>
        appointmentService.getByDisclosureId(params.disclosureId),
      {
        params: t.Object({
          disclosureId: t.String({ format: "uuid" }),
        }),
      },
    )

    .post(
      "",
      ({ body, appointmentService, user }) =>
        appointmentService.addAppointment({ ...body, createdBy: user.id }),
      {
        body: addAppointmentModel,
      },
    )

    .put(
      "",
      ({ body, appointmentService, user }) =>
        appointmentService.updateAppointment({ ...body, updatedBy: user.id }),

      {
        body: updateAppointmentModel,
      },
    ),
);
