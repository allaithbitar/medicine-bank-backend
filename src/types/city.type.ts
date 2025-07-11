import { Static } from "elysia";
import {
  addCityModel,
  citySelectModel,
  filterCitiesModel,
  updateCityModel,
} from "../models/city.model";

export type TCity = Static<typeof citySelectModel>;

export type TAddCityDto = Static<typeof addCityModel>;

export type TUpdateCityDto = Static<typeof updateCityModel>;

export type TFilterCitiesDto = Static<typeof filterCitiesModel>;
