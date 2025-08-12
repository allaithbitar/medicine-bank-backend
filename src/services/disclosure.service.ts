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
  TUpdateDisclosureDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";
@injectable()
export class DisclosureService {
  constructor(@inject(DisclosureRepo) private disclosureRepo: DisclosureRepo) {}

  getDisclosureById(id: string) {
    return this.disclosureRepo.getByIdWithIncludes(id);
  }

  addDisclosure(dto: TAddDisclosureDto) {
    return this.disclosureRepo.create(dto);
  }

  updateDisclosure(dto: TUpdateDisclosureDto) {
    return this.disclosureRepo.update(dto);
  }

  searchDisclosures(dto: TFilterDisclosuresDto) {
    return this.disclosureRepo.findManyWithIncludesPaginated(dto);
  }

  getDisclosureRatings(dto: TGetDisclosureRatingsDto) {
    return this.disclosureRepo.getDislosureRatings(dto);
  }

  async getDisclosureRating(id: string) {
    const result = await this.disclosureRepo.getDisclosureRating(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
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

  async getDisclosureVisit(id: string) {
    const result = await this.disclosureRepo.getDisclosureVisit(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    return this.disclosureRepo.addDisclosureVisit(dto);
  }

  updateDisclosureVisit(dto: TUpdateDisclosureVisitDto) {
    return this.disclosureRepo.updateDislosureVisit(dto);
  }

  async getDisclosuresRatings() {
    return await this.disclosureRepo.getDisclosuresRatings();
  }

  async getDisclosuresVisits() {
    return await this.disclosureRepo.getDisclosuresVisits();
  }
}
