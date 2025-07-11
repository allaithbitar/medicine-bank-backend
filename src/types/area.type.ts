import { Static } from "elysia";
import {
  addAreaModel,
  areaInsertModel,
  filterAreasModel,
  updateAreaModel,
} from "../models/area.model";

export type TArea = Static<typeof areaInsertModel>;

export type TAddAreaDto = Static<typeof addAreaModel>;

export type TUpdateAreaDto = Static<typeof updateAreaModel>;

export type TFilterAreasDto = Static<typeof filterAreasModel>;
