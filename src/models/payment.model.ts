import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { payments } from "../db/schema";
import { t } from "elysia";
import { paginationModel } from "./common.model";

export const paymentInsertModel = createInsertSchema(payments);

export const paymentSelectModel = createSelectSchema(payments);

export const createPaymentModel = t.Omit(paymentInsertModel, ["id"]);

export const updatePaymentModel = t.Composite([
  t.Pick(paymentSelectModel, ["id"]),
  t.Partial(paymentInsertModel),
]);

const filters = t.Object({
  scoutIds: t.Array(t.String({ format: "uuid" })),
  dateFrom: t.String({ format: "date-time" }),
  dateTo: t.String({ format: "date-time" }),
});

export const filterPaymentsModel = t.Composite([
  paginationModel,
  t.Partial(filters),
]);

export const markDisclosuresAsPaidModel = t.Composite([
  t.Partial(t.Omit(filters, ["scoutIds"])),
  t.Object({
    scoutId: t.String({ format: "uuid" }),
  }),
]);

// export const getScoutPaymentsModel = t.Composite([
//   t.Object({
//     scoutId: t.String({ format: "uuid" }),
//   }),
//   t.Partial(
//     t.Object({
//       dateFrom: t.String({ format: "date-time" }),
//       dateTo: t.String({ format: "date-time" }),
//     }),
//   ),
// ]);
