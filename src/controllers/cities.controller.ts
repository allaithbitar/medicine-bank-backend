import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  addCityModel,
  filterCitiesModel,
  updateCityModel,
} from "../models/city.model";
import { CityService } from "../services/city.service";

export const CitiesController = new Elysia({
  name: "Cities.Controller",
  tags: ["Cities"],
}).group("/cities", (app) =>
  app
    .resolve(() => ({
      cityServcie: DiContainer.get(CityService),
    }))
    .get(
      "",
      async ({ cityServcie, query }) => cityServcie.getCities(query),

      {
        query: filterCitiesModel,
      },
    )
    .post(
      "",
      async ({ cityServcie, body }) => cityServcie.addCity(body),

      {
        body: addCityModel,
      },
    )
    .put("", async ({ cityServcie, body }) => cityServcie.updateCity(body), {
      body: updateCityModel,
    }),
);
