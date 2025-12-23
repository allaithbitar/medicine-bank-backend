import { Static } from "elysia";
import {
  addDisclosureConsultationModel,
  addDisclosureModel,
  addDisclosureNoteModel,
  addDisclosureRatingModel,
  completeDisclosureConsultationModel,
  disclosureConsultationSelectModel,
  disclosureSelectModel,
  getDisclosureAuditLogsModel,
  getDisclosureConsultationsModel,
  getDisclosureNotesModel,
  getDisclosureRatingsModel,
  moveDisclosuresModel,
  searchDisclosuresModel,
  updateDisclosureConsultationModel,
  updateDisclosureModel,
  updateDisclosureNoteModel,
  updateDisclosureRatingModel,
  // updateVisitModel,
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

// export type TUpdateVisitDto = Static<typeof updateVisitModel> & TUpdatedBy;

// export type

// export type TUpdateDisclosureDto =Static<typeof updateDis>
export type TGetDisclosureNotesDto = Static<typeof getDisclosureNotesModel>;

export type TAddDisclosureNoteDto = Static<typeof addDisclosureNoteModel> &
  TCreatedBy;

export type TAddDisclosureNoteEntityDto = Omit<
  TAddDisclosureNoteDto,
  "audioFile"
> & { noteAudio?: string };

export type TUpdateDisclosureNoteDto = Static<
  typeof updateDisclosureNoteModel
> &
  TUpdatedBy;

export type TUpdateDisclosureNoteEntityDto = Omit<
  TUpdateDisclosureNoteDto,
  "audioFile" | "updatedBy" | "deleteAudioFile"
> & {
  noteAudio?: string;
};

export type TGetDisclosureAuditLogsDto = Static<
  typeof getDisclosureAuditLogsModel
>;

export type TMoveDisclosuresDto = Static<typeof moveDisclosuresModel>;

// CONSULTATIONS
export type TDisclosureConsultation = Static<
  typeof disclosureConsultationSelectModel
>;

export type TAddDisclosureConsultationDto = Static<
  typeof addDisclosureConsultationModel
> &
  TCreatedBy;

export type TAddDisclosureConsultationEntityDto = Omit<
  Static<typeof addDisclosureConsultationModel> &
    TCreatedBy & { consultationAudio?: string },
  "consultationAudioFile"
>;

export type TUpdateDisclosureConsultationDto = Static<
  typeof updateDisclosureConsultationModel
> &
  TUpdatedBy;

export type TUpdateDisclosureConsultationEntityDto = Omit<
  TUpdateDisclosureConsultationDto,
  "consultationAudioFile" | "deleteAudioFile"
> &
  TUpdatedBy & { consultationAudio?: string | null };

export type TGetDisclosureConsultationsDto = Static<
  typeof getDisclosureConsultationsModel
>;

export type TCompleteDisclosureConsultationsDto = Static<
  typeof completeDisclosureConsultationModel
> &
  TCreatedBy;
