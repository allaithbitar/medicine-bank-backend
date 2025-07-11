import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {
  addDisclosureModel,
  addDisclosureRatingModel,
  searchDisclosuresModel,
  updateDisclosureModel,
  updateDisclosureRatingModel,
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
        "search",
        ({ body, disclosureService }) =>
          disclosureService.searchDisclosures(body),

        {
          body: searchDisclosuresModel,
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
