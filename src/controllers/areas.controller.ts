import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { AreaService } from "../services/area.service";
import {
  addAreaModel,
  filterAreasModel,
  updateAreaModel,
} from "../models/area.model";
import { AuthGuard } from "../guards/auth.guard";

export const AreasController = new Elysia({
  name: "Areas.Controller",
  tags: ["Areas"],
}).group("/areas", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      areaService: DiContainer.get(AreaService),
    }))
    .get("", ({ areaService, query }) => areaService.getAreas(query), {
      query: filterAreasModel,
    })
    .post("", async ({ areaService, body }) => areaService.addArea(body), {
      body: addAreaModel,
      roles: ["manager", "supervisor"],
    })
    .put("", async ({ areaService, body }) => areaService.updateArea(body), {
      body: updateAreaModel,
      roles: ["manager", "supervisor"],
    }),
);
