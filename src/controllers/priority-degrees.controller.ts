import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addPriorityDegreeModel,
  filterPriorityDegreesModel,
  priorityDegreeSelectModel,
  updatePriorityDegreeModel,
} from "../models/priority-degree.model";
import { PriorityDegreeService } from "../services/priority-degree.service";
import { AuthGuard } from "../guards/auth.guard";

export const PriorityDegreesController = new Elysia({
  name: "PriorityDegrees.Controller",
  tags: ["Priority Degrees"],
}).group("/priority-degrees", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      prorityDegreeService: DiContainer.get(PriorityDegreeService),
    }))
    .get(
      "",
      ({ query, prorityDegreeService }) =>
        prorityDegreeService.getPriorityDegrees(query),
      {
        query: filterPriorityDegreesModel,
      },
    )
    .get(
      ":id",
      ({ params, prorityDegreeService }) =>
        prorityDegreeService.getPriorityDegree(params.id),
      {
        params: t.Pick(priorityDegreeSelectModel, ["id"]),
      },
    )
    .post(
      "",
      ({ body, prorityDegreeService }) =>
        prorityDegreeService.addPriorityDegree(body),
      {
        body: addPriorityDegreeModel,
        roles: ["manager"],
      },
    )
    .put(
      "",
      ({ prorityDegreeService, body }) =>
        prorityDegreeService.updatePriorityDegree(body),
      {
        body: updatePriorityDegreeModel,
        roles: ["manager"],
      },
    ),
);
