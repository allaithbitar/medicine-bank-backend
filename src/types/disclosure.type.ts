import { Static } from "elysia";
import {
  addDisclosureModel,
  addDisclosureNoteModel,
  addDisclosureRatingModel,
  addDisclosureVisitModel,
  disclosureSelectModel,
  getDisclosureAuditLogsModel,
  getDisclosureNotesModel,
  getDisclosureRatingsModel,
  getDisclosureVisitsModel,
  searchDisclosuresModel,
  updateDisclosureModel,
  updateDisclosureNoteModel,
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
export type TGetDisclosureNotesDto = Static<typeof getDisclosureNotesModel>;

export type TAddDisclosureNoteDto = Static<typeof addDisclosureNoteModel> &
  TCreatedBy;

export type TUpdateDisclosureNoteDto = Static<
  typeof updateDisclosureNoteModel
> &
  TUpdatedBy;

export type TGetDisclosureAuditLogsDto = Static<
  typeof getDisclosureAuditLogsModel
>;
