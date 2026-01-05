import { Static } from "elysia";
import {
  addDisclosureConsultationModel,
  addDisclosureModel,
  addDisclosureNoteModel,
  completeDisclosureConsultationModel,
  disclosureConsultationSelectModel,
  disclosureDetailsInsertModel,
  disclosureSelectModel,
  getDateAppointmentsModel,
  getDisclosureAppointmentsModel,
  getDisclosureAuditLogsModel,
  getDisclosureConsultationsModel,
  getDisclosureNotesModel,
  moveDisclosuresModel,
  searchDisclosuresModel,
  updateDisclosureConsultationModel,
  updateDisclosureModel,
  updateDisclosureNoteModel,
  // updateVisitModel,
} from "../models/disclosure.model";

import { TCreatedBy, TUpdatedBy } from "./common.types";

export type TDisclosure = Static<typeof disclosureSelectModel>;

export type TAddDisclosureDto = Static<typeof addDisclosureModel> & TCreatedBy;

export type TUpdateDisclosureDto = Static<typeof updateDisclosureModel> &
  TUpdatedBy;

export type TFilterDisclosuresDto = Static<typeof searchDisclosuresModel>;

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
  TUpdatedBy;

export type TGetDisclosureAppointmentsDto = Static<
  typeof getDisclosureAppointmentsModel
>;

export type TGetDateAppointmentsDto = Static<typeof getDateAppointmentsModel>;

export type TAddDisclosureDetailsEntityDto = Static<
  typeof disclosureDetailsInsertModel
>;

export type TAddDisclosureDetailsDto = TAddDisclosureDetailsEntityDto &
  TCreatedBy;

export type TUpdateDisclosureDetailsDto = TAddDisclosureDetailsEntityDto &
  TUpdatedBy;
