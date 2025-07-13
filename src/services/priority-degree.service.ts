import "reflect-metadata";
import { inject, injectable } from "inversify";

import { PriorityDegreeRepo } from "../repos/priority-degree.repo";
import {
  TAddPriorityDegreeDto,
  TFilterPriorityDegreesDto,
  TUpdatePriorityDegreeDto,
} from "../types/priority-degree.type";
@injectable()
export class PriorityDegreeService {
  constructor(
    @inject(PriorityDegreeRepo) private priorityDegreeRepo: PriorityDegreeRepo,
  ) {}

  getPriorityDegrees(dto: TFilterPriorityDegreesDto) {
    return this.priorityDegreeRepo.findMany(dto);
  }

  addPriorityDegree(dto: TAddPriorityDegreeDto) {
    return this.priorityDegreeRepo.create(dto);
  }

  updatePriorityDegree(dto: TUpdatePriorityDegreeDto) {
    return this.priorityDegreeRepo.update(dto);
  }
}
