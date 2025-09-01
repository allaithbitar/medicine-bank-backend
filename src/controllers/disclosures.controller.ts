import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
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
import { DisclosureService } from "../services/disclosure.service";
import { AuthGuard } from "../guards/auth.guard";

export const DisclosuresController = new Elysia({
  name: "Disclosures.Controller",
  tags: ["Disclosures"],
}).group("/disclosures", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({
      disclosureService: DiContainer.get(DisclosureService),
    }))
    .post(
      "search",
      ({ body, disclosureService }) =>
        disclosureService.searchDisclosures(body),

      {
        body: searchDisclosuresModel,
      },
    )
    .get(
      ":id",
      ({ params, disclosureService }) =>
        disclosureService.getDisclosureById(params.id),

      {
        params: t.Pick(disclosureSelectModel, ["id"]),
      },
    )
    .post(
      "",
      ({ body, disclosureService, user }) => {
        disclosureService.addDisclosure({ ...body, createdBy: user.id });
      },
      {
        body: addDisclosureModel,
        roles: ["manager", "supervisor"],
      },
    )
    .put(
      "",
      ({ body, disclosureService, user }) => {
        disclosureService.updateDisclosure({ ...body, updatedBy: user.id });
      },
      {
        body: updateDisclosureModel,
        roles: ["manager", "supervisor"],
      },
    )
    .get(
      "/ratings",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureRatings(query),

      {
        query: getDisclosureRatingsModel,
      },
    )

    .get(
      "/ratings/:id",
      ({ params, disclosureService }) =>
        disclosureService.getDisclosureRating(params.id),

      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )

    .post(
      "/ratings",
      ({ body, disclosureService, user }) =>
        disclosureService.addDisclosureRating({ ...body, createdBy: user.id }),

      {
        body: addDisclosureRatingModel,
      },
    )
    .put(
      "/ratings",
      ({ body, disclosureService, user }) =>
        disclosureService.updateDisclosureRating({
          ...body,
          updatedBy: user.id,
        }),

      {
        body: updateDisclosureRatingModel,
      },
    )
    .get(
      "/visits",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureVisits(query),

      {
        query: getDisclosureVisitsModel,
      },
    )
    .get(
      "/visits/:id",
      ({ params, disclosureService }) =>
        disclosureService.getDisclosureVisit(params.id),

      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )

    .post(
      "/visits",
      ({ body, disclosureService, user }) =>
        disclosureService.addDisclosureVisit({ ...body, createdBy: user.id }),

      {
        body: addDisclosureVisitModel,
      },
    )
    .put(
      "/visits",
      ({ body, disclosureService, user }) =>
        disclosureService.updateDisclosureVisit({
          ...body,
          updatedBy: user.id,
        }),
      {
        body: updateDisclosureVisitModel,
      },
    ),
);
