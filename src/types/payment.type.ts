import { Static } from "elysia";
import {
  createPaymentModel,
  filterPaymentsModel,
  markDisclosuresAsPaidModel,
  updatePaymentModel,
} from "../models/payment.model";
import { TCreatedBy } from "./common.types";

export type TAddPaymentDto = Static<typeof createPaymentModel>;

export type TUpdatePaymentDto = Static<typeof updatePaymentModel>;

export type TFilterPaymentsDto = Static<typeof filterPaymentsModel>;

export type TMarkDisclosuresAsPaidDto = Static<
  typeof markDisclosuresAsPaidModel
> &
  TCreatedBy;
// export type TGetScoutPaymentsDto = Static<typeof getScoutPaymentsModel>;
