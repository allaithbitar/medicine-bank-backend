import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  addPriorityDegreeModel,
  filterPrioityDegreesModel,
  updatePriorityDegreeModel,
} from "../models/priority-degree.model";
import { PriorityDegreeService } from "../services/priority-degree.service";

export const PriorityDegreesController = new Elysia({
  name: "PriorityDegrees.Controller",
  tags: ["Priority Degrees"],
}).group("/priority-degrees", (app) =>
  app
    .resolve(() => ({
      prorityDegreeService: DiContainer.get(PriorityDegreeService),
    }))
    .get(
      "",
      ({ query, prorityDegreeService }) =>
        prorityDegreeService.getPriorityDegrees(query),
      {
        query: filterPrioityDegreesModel,
      },
    )

    .post(
      "",
      ({ body, prorityDegreeService }) =>
        prorityDegreeService.addPriorityDegree(body),
      {
        body: addPriorityDegreeModel,
      },
    )
    .put(
      "",
      ({ prorityDegreeService, body }) =>
        prorityDegreeService.updatePriorityDegree(body),
      {
        body: updatePriorityDegreeModel,
      },
    ),
);
