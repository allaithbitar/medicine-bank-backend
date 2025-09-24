import { appointments } from "../db/schema";
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const appointmentInsertModel = createInsertSchema(appointments);

export const appointmentSelectModel = createSelectSchema(appointments);

export const addAppointmentModel = t.Omit(appointmentInsertModel, [
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updateAppointmentModel = t.Composite([
  addAppointmentModel,
  t.Required(t.Pick(appointmentInsertModel, ["id"])),
]);

export const filterAppointmentsModel = t.Composite([
  t.Object({
    fromDate: t.String({ format: "date" }),
    toDate: t.String({ format: "date" }),
  }),
]);
