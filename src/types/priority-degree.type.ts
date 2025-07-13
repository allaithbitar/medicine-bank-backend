import { Static } from "elysia";
import {
  addPriorityDegreeModel,
  filterPriorityDegreesModel,
  priorityDegreeSelectModel,
  updatePriorityDegreeModel,
} from "../models/priority-degree.model";

export type TPriorityDegree = Static<typeof priorityDegreeSelectModel>;

export type TAddPriorityDegreeDto = Static<typeof addPriorityDegreeModel>;

export type TUpdatePriorityDegreeDto = Static<typeof updatePriorityDegreeModel>;

export type TFilterPriorityDegreesDto = Static<
  typeof filterPriorityDegreesModel
>;
