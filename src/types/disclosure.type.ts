import { Static } from "elysia";
import {
  addDisclosureModel,
  addDisclosureRatingModel,
  addDisclosureVisitModel,
  disclosureSelectModel,
  getDisclosureRatingsModel,
  getDisclosureVisitsModel,
  searchDisclosuresModel,
  updateDisclosureModel,
  updateDisclosureRatingModel,
  updateDisclosureVisitModel,
} from "../models/disclosure.model";
import { InferInsertModel } from "drizzle-orm";
import { disclosuresToRatings } from "../db/schema";

export type TDisclosure = Static<typeof disclosureSelectModel>;

export type TAddDisclosureDto = Static<typeof addDisclosureModel>;

export type TUpdateDisclosureDto = Static<typeof updateDisclosureModel>;

export type TFilterDisclosuresDto = Static<typeof searchDisclosuresModel>;

export type TGetDisclosureRatingsDto = Static<typeof getDisclosureRatingsModel>;

export type TAddDisclosureRatingDto = Static<typeof addDisclosureRatingModel> &
  Pick<
    InferInsertModel<typeof disclosuresToRatings>,
    "createdAt" | "createdBy"
  >;

export type TUpdateDisclosureRatingDto = Static<
  typeof updateDisclosureRatingModel
> &
  Pick<InferInsertModel<typeof disclosuresToRatings>, "updatedBy">;

export type TGetDisclosureVisitsDto = Static<typeof getDisclosureVisitsModel>;

export type TAddDisclosureVisitDto = Static<typeof addDisclosureVisitModel>;

export type TUpdateDisclosureVisitDto = Static<
  typeof updateDisclosureVisitModel
>;

// export type

// export type TUpdateDisclosureDto =Static<typeof updateDis>
