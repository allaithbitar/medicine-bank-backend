import "reflect-metadata";
import { inject, injectable } from "inversify";
import { PaymentRepo } from "../repos/payment.repo";
import {
  TGetEligibleDisclosuresDto,
  TMarkDisclosuresAsPaidDto,
} from "../types/payment.type";

@injectable()
export class PaymentService {
  constructor(@inject(PaymentRepo) private paymentRepo: PaymentRepo) {}

  async getPaymentsHistory(dto: TGetEligibleDisclosuresDto) {
    return this.paymentRepo.getPaymentsHistory(dto);
  }

  async getEligibleDisclosures(dto: TGetEligibleDisclosuresDto) {
    return this.paymentRepo.getEligibleDisclosures(dto);
  }

  async markDisclosuresAsPaid(dto: TMarkDisclosuresAsPaidDto) {
    return this.paymentRepo.markDisclosuresAsPaid(dto);
  }
}
