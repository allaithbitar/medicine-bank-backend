import { t } from "elysia";

export const getSatisticsModel = t.Object({
  fromDate: t.String({ format: "date-time" }),
  toDate: t.String({ format: "date-time" }),
  employeeId: t.Optional(t.String({ format: "uuid" })),
});

export const getHalfDetailedSatisticsByAreaModel = t.Composite([
  getSatisticsModel,
  t.Object({
    areaIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  }),
]);
