import "reflect-metadata";
import { inject, injectable } from "inversify";
import { DisclosureRepo } from "../repos/disclosure.repo";
import {
  TAddDisclosureDto,
  TAddDisclosureRatingDto,
  TAddDisclosureVisitDto,
  TFilterDisclosuresDto,
  TGetDisclosureRatingsDto,
  TGetDisclosureVisitsDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
@injectable()
export class DisclosureService {
  constructor(@inject(DisclosureRepo) private disclosureRepo: DisclosureRepo) {}

  getDisclosureById(id: string) {
    return this.disclosureRepo.getByIdWithIncludes(id);
  }

  addDisclosure(dto: TAddDisclosureDto) {
    return this.disclosureRepo.create(dto);
  }

  searchDisclosures(dto: TFilterDisclosuresDto) {
    return this.disclosureRepo.findManyWithIncludesPaginated(dto);
  }

  getDisclosureRatings(dto: TGetDisclosureRatingsDto) {
    return this.disclosureRepo.getDislosureRatings(dto);
  }

  addDisclosureRating(dto: TAddDisclosureRatingDto) {
    return this.disclosureRepo.addDisclosureRating(dto);
  }

  updateDisclosureRating(dto: TUpdateDisclosureRatingDto) {
    return this.disclosureRepo.updateDislosureRating(dto);
  }

  getDisclosureVisits(dto: TGetDisclosureVisitsDto) {
    return this.disclosureRepo.getDisclosureVisits(dto);
  }

  addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    return this.disclosureRepo.addDisclosureVisit(dto);
  }

  updateDisclosureVisit(dto: TUpdateDisclosureVisitDto) {
    return this.disclosureRepo.updateDislosureVisit(dto);
  }
}
