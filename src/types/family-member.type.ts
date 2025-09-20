import { Static } from "elysia";
import {
  addFamilyMemberModel,
  familyMemberSelectModel,
  filterFamilyMembersModel,
  updateFamilyMemberModel,
} from "../models/family-member.model";
import { TCreatedBy, TUpdatedBy } from "./common.types";

export type TFilterFamilyMembersDto = Static<typeof filterFamilyMembersModel>;

export type TFamilyMember = Static<typeof familyMemberSelectModel>;

export type TAddFamilyMemberDto = Static<typeof addFamilyMemberModel> &
  TCreatedBy;

export type TUpdateFamilyMemberDto = Static<typeof updateFamilyMemberModel> &
  TUpdatedBy;
