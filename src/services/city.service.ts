import "reflect-metadata";
import { inject, injectable } from "inversify";
import { CityRepo } from "../repos/city.repo";
import {
  TAddCityDto,
  TFilterCitiesDto,
  TUpdateCityDto,
} from "../types/city.type";
@injectable()
export class CityService {
  constructor(@inject(CityRepo) private cityRepo: CityRepo) {}

  getCities(dto: TFilterCitiesDto) {
    return this.cityRepo.findManyPaginated(dto);
  }

  getCity(id: string) {
    return this.cityRepo.findById(id);
  }

  addCity(dto: TAddCityDto) {
    return this.cityRepo.create(dto);
  }

  updateCity(dto: TUpdateCityDto) {
    return this.cityRepo.update(dto);
  }
}
