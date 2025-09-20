import { familyMembers } from "../db/schema";
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { paginationModel } from "./common.model";

export const familyMemberInsertModel = createInsertSchema(familyMembers);

export const familyMemberSelectModel = createSelectSchema(familyMembers);

export const addFamilyMemberModel = t.Omit(familyMemberInsertModel, [
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

export const updateFamilyMemberModel = t.Composite([
  addFamilyMemberModel,
  t.Required(t.Pick(familyMemberInsertModel, ["id"])),
]);

export const filterFamilyMembersModel = t.Composite([
  paginationModel,
  t.Required(t.Pick(familyMemberInsertModel, ["patientId"])),
]);

// export const deleteFamilyMemberModel = t.Composite([
//   t.Required(t.Pick(familyMemberInsertModel, ["id"])),
//   t.Required(t.Pick(familyMemberInsertModel, ["patientId"])),
// ]);
