import { t } from "elysia";

export const getSatisticsModel = t.Object({
  fromDate: t.String({ format: "date-time" }),
  toDate: t.String({ format: "date-time" }),
  employeeId: t.Optional(t.String({ format: "uuid" })),
});
