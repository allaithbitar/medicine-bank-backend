import "reflect-metadata";
import { inject, injectable } from "inversify";
import { PaymentRepo } from "../repos/payment.repo";
import {
  TFilterPaymentsDto,
  TMarkDisclosuresAsPaidDto,
} from "../types/payment.type";

@injectable()
export class PaymentService {
  constructor(@inject(PaymentRepo) private paymentRepo: PaymentRepo) {}

  async getPaymentsHistory(dto: TFilterPaymentsDto) {
    return this.paymentRepo.getPaymentsHistory(dto);
  }

  async getEligibleDisclosures(dto: TFilterPaymentsDto) {
    return this.paymentRepo.getEligibleDisclosures(dto);
  }

  async markDisclosuresAsPaid(dto: TMarkDisclosuresAsPaidDto) {
    return this.paymentRepo.markDisclosuresAsPaid(dto);
  }
}
