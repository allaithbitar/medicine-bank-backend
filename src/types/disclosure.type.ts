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

import { TCreatedBy, TUpdatedBy } from "./common.types";

export type TDisclosure = Static<typeof disclosureSelectModel>;

export type TAddDisclosureDto = Static<typeof addDisclosureModel> & TCreatedBy;

export type TUpdateDisclosureDto = Static<typeof updateDisclosureModel> &
  TUpdatedBy;

export type TFilterDisclosuresDto = Static<typeof searchDisclosuresModel>;

export type TGetDisclosureRatingsDto = Static<typeof getDisclosureRatingsModel>;

export type TAddDisclosureRatingDto = Static<typeof addDisclosureRatingModel> &
  TCreatedBy;

export type TUpdateDisclosureRatingDto = Static<
  typeof updateDisclosureRatingModel
> &
  TUpdatedBy;

export type TGetDisclosureVisitsDto = Static<typeof getDisclosureVisitsModel>;

export type TAddDisclosureVisitDto = Static<typeof addDisclosureVisitModel> &
  TCreatedBy;

export type TUpdateDisclosureVisitDto = Static<
  typeof updateDisclosureVisitModel
> &
  TUpdatedBy;

// export type

// export type TUpdateDisclosureDto =Static<typeof updateDis>
