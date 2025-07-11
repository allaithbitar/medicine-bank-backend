import "reflect-metadata";
import { inject, injectable } from "inversify";
import { AreaRepo } from "../repos/area.repo";
import {
  TAddAreaDto,
  TFilterAreasDto,
  TUpdateAreaDto,
} from "../types/area.type";
@injectable()
export class AreaService {
  constructor(@inject(AreaRepo) private areaRepo: AreaRepo) {}

  getAreas(dto: TFilterAreasDto) {
    return this.areaRepo.findManyPaginated(dto);
  }

  addArea(dto: TAddAreaDto) {
    return this.areaRepo.create(dto);
  }

  updateArea(dto: TUpdateAreaDto) {
    return this.areaRepo.update(dto);
  }
}
