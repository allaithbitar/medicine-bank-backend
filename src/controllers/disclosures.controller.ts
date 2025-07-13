import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  addDisclosureModel,
  addDisclosureRatingModel,
  addDisclosureVisitModel,
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
      .post(
        "/rating",
        ({ body, disclosureService }) =>
          disclosureService.addDisclosureRating(body),

        {
          body: addDisclosureRatingModel,
        },
      )
      .put(
        "/rating",
        ({ body, disclosureService }) =>
          disclosureService.updateDisclosureRating(body),

        {
          body: updateDisclosureRatingModel,
        },
      )
      .post(
        "/visit",
        ({ body, disclosureService }) =>
          disclosureService.addDisclosureVisit(body),

        {
          body: addDisclosureVisitModel,
        },
      )
      .put(
        "/visit",
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
