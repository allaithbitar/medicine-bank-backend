import "reflect-metadata";
import { inject, injectable } from "inversify";
import { RatingRepo } from "../repos/rating.repo";
import {
  TAddRatingDto,
  TFilterRatingsDto,
  TUpdateRatingDto,
} from "../types/rating.type";

@injectable()
export class RatingService {
  constructor(@inject(RatingRepo) private ratingRepo: RatingRepo) {}

  getRatings(dto: TFilterRatingsDto) {
    return this.ratingRepo.findMany(dto);
  }

  addRating(dto: TAddRatingDto) {
    return this.ratingRepo.create(dto);
  }

  updateRating(dto: TUpdateRatingDto) {
    return this.ratingRepo.update(dto);
  }
}
