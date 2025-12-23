import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addDisclosureConsultationModel,
  addDisclosureModel,
  addDisclosureNoteModel,
  addDisclosureRatingModel,
  completeDisclosureConsultationModel,
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
      async ({ body, disclosureService, user }) => {
        await disclosureService.updateDisclosure(body.id, user.id, body);
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
      "consultations",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureConsultations(query),
      {
        query: getDisclosureConsultationsModel,
      },
    )
    .get(
      "consultations/:id",
      ({ params, disclosureService }) =>
        disclosureService.getDisclosureConsultation(params.id),
      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )
    .post(
      "consultations",
      ({ body, disclosureService, user }) => {
        return disclosureService.addDisclosureConsultation({
          ...body,
          createdBy: user.id,
        });
      },
      {
        body: addDisclosureConsultationModel,
        parse: "multipart/form-data",
      },
    )
    .put(
      "consultations",
      ({ body, disclosureService, user }) => {
        return disclosureService.updateDisclosureConsultation({
          ...body,
          updatedBy: user.id,
        });
      },
      {
        body: updateDisclosureConsultationModel,
      },
    )
    .put(
      "consultations/complete",
      ({ body, disclosureService, user }) => {
        return disclosureService.completeConsultation({
          ...body,
          createdBy: user.id,
        });
      },
      {
        body: completeDisclosureConsultationModel,
      },
    )


    .get(
      "/notes",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureNotes(query),

      {
        query: getDisclosureNotesModel,
      },
    )
    .get(
      "/notes/:id",
      ({ params, disclosureService }) =>
        disclosureService.getDisclosureNote(params.id),

      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )

    .post(
      "/notes",
      ({ body, disclosureService, user }) =>
        disclosureService.addDisclsoureNote({ ...body, createdBy: user.id }),

      {
        body: addDisclosureNoteModel,
        parse: "multipart/form-data",
      },
    )
    .put(
      "/notes",
      ({ body, disclosureService, user }) =>
        disclosureService.updateDisclsoureNote({ ...body, updatedBy: user.id }),

      {
        body: updateDisclosureNoteModel,
        parse: "multipart/form-data",
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
      "/audit-log",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureAuditLogsGroupedByDate(query),
      {
        query: getDisclosureAuditLogsModel,
        roles: ["supervisor"],
      },
    )
    .post(
      "/audit-log/details",
      ({ body, disclosureService }) => {
        return disclosureService.getDisclosureAuditLogsByDate(
          body.disclosureId,
          body.date,
        );
      },
      {
        body: t.Composite([
          getDisclosureAuditLogsModel,
          t.Object({
            date: t.String({ date: t.String({ format: "date-time" }) }),
          }),
        ]),
        roles: ["supervisor"],
      },
    )
    .post(
      "/move",
      ({ body, disclosureService, user }) =>
        disclosureService.moveDisclosures(body, user.id),
      {
        body: moveDisclosuresModel,
        roles: ["manager", "supervisor"],
      },
    ),
);
