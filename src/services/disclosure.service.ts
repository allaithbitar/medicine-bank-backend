import "reflect-metadata";
import { inject, injectable } from "inversify";
import { DisclosureRepo } from "../repos/disclosure.repo";
import {
  TAddDisclosureDto,
  TAddDisclosureRatingDto,
  TFilterDisclosuresDto,
  TUpdateDisclosureRatingDto,
} from "../types/disclosure.type";
@injectable()
export class DisclosureService {
  constructor(@inject(DisclosureRepo) private disclosureRepo: DisclosureRepo) {}

  addDisclosure(dto: TAddDisclosureDto) {
    return this.disclosureRepo.create(dto);
  }

  searchDisclosures(dto: TFilterDisclosuresDto) {
    return this.disclosureRepo.findManyWithIncludesPaginated(dto);
  }

  addDisclosureRating(dto: TAddDisclosureRatingDto) {
    return this.disclosureRepo.addDisclosureRating(dto);
  }

  updateDisclosureRating(dto: TUpdateDisclosureRatingDto) {
    return this.disclosureRepo.updateDislosureRating(dto);
  }
}
