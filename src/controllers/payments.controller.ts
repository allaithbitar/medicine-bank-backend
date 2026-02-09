import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  markDisclosuresAsPaidModel,
  filterPaymentsModel,
} from "../models/payment.model";
import { PaymentService } from "../services/payment.service";
import { AuthGuard } from "../guards/auth.guard";

export const PaymentsController = new Elysia({
  name: "Payments.Controller",
  tags: ["Payments"],
}).group(
  "/payments",
  (app) =>
    app
      .use(AuthGuard)
      .resolve(() => ({
        paymentService: DiContainer.get(PaymentService),
      }))
      .post(
        "/get-history",
        ({ body, paymentService }) => paymentService.getPaymentsHistory(body),
        {
          body: filterPaymentsModel,
          roles: ["accountant"],
        },
      )

      .post(
        "/get-eligible",
        ({ body, paymentService }) =>
          paymentService.getEligibleDisclosures(body),
        {
          body: filterPaymentsModel,
          roles: ["accountant"],
        },
      )
      .put(
        "/mark-as-paid",
        ({ body, paymentService, user }) =>
          paymentService.markDisclosuresAsPaid({ ...body, createdBy: user.id }),
        {
          body: markDisclosuresAsPaidModel,
          roles: ["accountant"],
        },
      ),

  // .post(
  //   "/mark-paid",
  //   ({ body, paymentService, user }) =>
  //     paymentService.markDisclosureAsPaid(body.disclosureId, user.id, {
  //       amount: body.amount,
  //       currency: body.currency,
  //       note: body.note,
  //     }),
  //   {
  //     body: paymentInsertModel,
  //     roles: ["accountant"],
  //   },
  // ),
  // .get(
  //   "/unpaid",
  //   ({ query, paymentService }) => paymentService.getUnpaidDisclosures(query),
  //   {
  //     query: getUnpaidDisclosuresModel,
  //     roles: ["accountant", "manager"],
  //   },
  // )
  // .get(
  //   "/scout/:scoutId",
  //   ({ params, query, paymentService, user }) => {
  //     // Allow scouts to view their own payments, or managers/accountants to view any
  //     const isViewingSelf = user.id === params.scoutId;
  //     const hasManagerAccess =
  //       user.role === "manager" || user.role === "accountant";
  //
  //     if (!isViewingSelf && !hasManagerAccess) {
  //       throw new Error("Forbidden: You can only view your own payments");
  //     }
  //
  //     return paymentService.getScoutPayments(params.scoutId, query);
  //   },
  //   {
  //     params: t.Object({
  //       scoutId: t.String({ format: "uuid" }),
  //     }),
  //     query: t.Partial(
  //       t.Object({
  //         dateFrom: t.String({ format: "date-time" }),
  //         dateTo: t.String({ format: "date-time" }),
  //         status: t.Array(paymentSelectModel.properties.status),
  //       }),
  //     ),
  //     roles: ["scout", "accountant", "manager"],
  //   },
  // )
  // .get(
  //   "/:id",
  //   ({ params, paymentService }) => paymentService.getPaymentById(params.id),
  //   {
  //     params: t.Pick(paymentSelectModel, ["id"]),
  //     roles: ["accountant", "manager"],
  //   },
  // )
  // .get(
  //   "/disclosure/:disclosureId",
  //   ({ params, paymentService }) =>
  //     paymentService.getPaymentByDisclosureId(params.disclosureId),
  //   {
  //     params: t.Object({
  //       disclosureId: t.String({ format: "uuid" }),
  //     }),
  //     roles: ["accountant", "manager", "scout"],
  //   },
  // )
  // .put(
  //   "",
  //   ({ body, paymentService }) =>
  //     paymentService.updatePayment(body.id, {
  //       status: body.status,
  //       paidBy: body.paidBy,
  //       paidAt: body.paidAt,
  //       note: body.note,
  //     }),
  //   {
  //     body: updatePaymentModel,
  //     roles: ["accountant"],
  //   },
  // ),
);
