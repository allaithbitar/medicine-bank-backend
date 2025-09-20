import Elysia from "elysia";
import {
  addFamilyMemberModel,
  filterFamilyMembersModel,
  updateFamilyMemberModel,
} from "../models/family-member.model";
import DiContainer from "../di/di-container";
import { FamilyMemberService } from "../services/family-member.service";
import { AuthGuard } from "../guards/auth.guard";

export const FamilyMembersController = new Elysia({
  name: "FamilyMembers.Controller",
  tags: ["Family Members"],
}).group(
  "/family-members",
  (app) =>
    app
      .use(AuthGuard)
      .resolve(() => ({
        familyMemberService: DiContainer.get(FamilyMemberService),
      }))
      .get(
        "",
        ({ familyMemberService, query }) =>
          familyMemberService.getFamilyMembers(query),
        {
          query: filterFamilyMembersModel,
        },
      )

      .post(
        "",
        ({ body, familyMemberService, user }) =>
          familyMemberService.addFamilyMember({ ...body, createdBy: user.id }),
        {
          body: addFamilyMemberModel,
        },
      )

      .put(
        "",
        ({ body, familyMemberService, user }) =>
          familyMemberService.updateFamilyMember({
            ...body,
            updatedBy: user.id,
          }),

        {
          body: updateFamilyMemberModel,
        },
      ),
  // .delete(
  //   "",
  //   ({ body }) => {
  //     // ratingService.getDetailedSatistics(body)
  //   },
  //   {
  //     query: deleteFamilyMemberModel,
  //   },
  // ),
);
