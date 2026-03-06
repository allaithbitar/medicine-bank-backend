import { Static } from "elysia";
import {
  getHalfDetailedSatisticsByAreaModel,
  getSatisticsModel,
} from "../models/satistics.model";

export type TGetSatisticsDto = Static<typeof getSatisticsModel>;

export type TGetHalfDetailedSatisticsByAreaDto = Static<
  typeof getHalfDetailedSatisticsByAreaModel
>;
