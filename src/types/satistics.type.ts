import { Static } from "elysia";
import { getSatisticsModel } from "../models/satistics.model";

export type TGetSatisticsDto = Static<typeof getSatisticsModel>;
