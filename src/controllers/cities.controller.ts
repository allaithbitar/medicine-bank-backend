import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addCityModel,
  citySelectModel,
  filterCitiesModel,
  updateCityModel,
} from "../models/city.model";
import { CityService } from "../services/city.service";
import { AuthGuard } from "../guards/auth.guard";

export const CitiesController = new Elysia({
  name: "Cities.Controller",
  tags: ["Cities"],
}).group("/cities", (app) =>
  app
    .use(AuthGuard)
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
    .get(
      ":id",
      async ({ cityServcie, params }) => cityServcie.getCity(params.id),

      {
        params: t.Pick(citySelectModel, ["id"]),
      },
    )

    .post(
      "",
      async ({ cityServcie, body }) => cityServcie.addCity(body),

      {
        body: addCityModel,
        roles: ["manager", "supervisor"],
      },
    )
    .put("", async ({ cityServcie, body }) => cityServcie.updateCity(body), {
      body: updateCityModel,
      roles: ["manager", "supervisor"],
    }),
);
