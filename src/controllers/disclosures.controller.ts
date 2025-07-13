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

export const DisclosuresController = new Elysia({
  name: "Disclosures.Controller",
  tags: ["Disclosures"],
}).group(
  "/disclosures",
  (app) =>
    app

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
        ({ body, disclosureService }) => {
          disclosureService.addDisclosure(body);
        },
        {
          body: addDisclosureModel,
        },
      )
      .put(
        "",
        ({ body, disclosureService }) => {
          disclosureService.addDisclosure(body);
        },
        {
          body: updateDisclosureModel,
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

      .post(
        "/ratings",
        ({ body, disclosureService }) =>
          disclosureService.addDisclosureRating(body),

        {
          body: addDisclosureRatingModel,
        },
      )
      .put(
        "/ratings",
        ({ body, disclosureService }) =>
          disclosureService.updateDisclosureRating(body),

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

      .post(
        "/visits",
        ({ body, disclosureService }) =>
          disclosureService.addDisclosureVisit(body),

        {
          body: addDisclosureVisitModel,
        },
      )
      .put(
        "/visits",
        ({ body, disclosureService }) =>
          disclosureService.updateDisclosureVisit(body),
        {
          body: updateDisclosureVisitModel,
        },
      ),

  // .put(
  //   "",
  //   () => {
  //     const db = DiContainer.get("db") as TDbContext;
  //     return db.query.employees.findMany({
  //       with: {
  //         area: true,
  //       },
  //     });
  //   },
  //   {
  //     body: updateEmployeeModel,
  //   },
  // ),
);
