import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import {
  addDisclosureConsultationModel,
  addDisclosureModel,
  addDisclosureNoteModel,
  archiveDisclosureModel,
  completeDisclosureConsultationModel,
  disclosureDetailsInsertModel,
  disclosureSelectModel,
  getDateAppointmentsModel,
  getDisclosureAppointmentsModel,
  getDisclosureAuditLogsModel,
  getDisclosureConsultationsModel,
  getDisclosureDetailsModel,
  getDisclosureNotesModel,
  moveDisclosuresModel,
  searchDisclosuresModel,
  updateDisclosureConsultationModel,
  updateDisclosureModel,
  updateDisclosureNoteModel,
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
    .get(
      "last/:patientId",
      ({ params, disclosureService }) =>
        disclosureService.getLastDisclosureByPatientId(params.patientId),

      {
        params: t.Object({
          patientId: t.String({ format: "uuid" }),
        }),
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
          updatedBy: user.id,
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
    )
    .get(
      "/appointments",
      ({ query, disclosureService }) =>
        disclosureService.getAppointments(query),
      {
        query: getDisclosureAppointmentsModel,
      },
    )
    .get(
      "/appointments/date",
      ({ query, disclosureService }) =>
        disclosureService.getDateAppointments(query),
      {
        query: getDateAppointmentsModel,
      },
    )
    .get(
      "/details",
      ({ query, disclosureService }) =>
        disclosureService.getDisclosureDetails(query.disclosureId),
      {
        query: getDisclosureDetailsModel,
      },
    )
    .post(
      "/details",
      ({ body, disclosureService, user }) =>
        disclosureService.addDisclosureDetails({ ...body, createdBy: user.id }),
      {
        body: disclosureDetailsInsertModel,
      },
    )
    .put(
      "/details",
      ({ body, disclosureService, user }) =>
        disclosureService.updateDisclosureDetails({
          ...body,
          updatedBy: user.id,
        }),
      {
        body: disclosureDetailsInsertModel,
      },
    )
    .put(
      "/archive",
      async ({ body, disclosureService, user }) => {
        await disclosureService.archiveDisclosure(body.id, user.id);
      },
      {
        body: archiveDisclosureModel,
        roles: ["manager", "supervisor"],
      },
    )
    .put(
      "/unarchive",
      async ({ body, disclosureService, user }) => {
        await disclosureService.unarchiveDisclosure(body.id, user.id);
      },
      {
        body: archiveDisclosureModel,
        roles: ["manager", "supervisor"],
      },
    ),
);
