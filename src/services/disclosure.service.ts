import "reflect-metadata";
import { inject, injectable } from "inversify";
import { DisclosureRepo } from "../repos/disclosure.repo";
import {
  TAddDisclosureConsultationDto,
  TAddDisclosureDetailsDto,
  TAddDisclosureDto,
  TAddDisclosureNoteDto,
  TAddDisclosurePropertiesDto,
  TAddSubPatientDto,
  TCompleteDisclosureConsultationsDto,
  TDisclosure,
  TFilterDisclosuresDto,
  TGetDateAppointmentsDto,
  TGetDisclosureAppointmentsDto,
  TGetDisclosureAuditLogsDto,
  TGetDisclosureConsultationsDto,
  TGetDisclosureNotesDto,
  TMoveDisclosuresDto,
  TUpdateDisclosureConsultationDto,
  TUpdateDisclosureDetailsDto,
  TUpdateDisclosureNoteDto,
  TUpdateDisclosurePropertiesDto,
  TUpdateSubPatientDto,
} from "../types/disclosure.type";
import {
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "../constants/errors";
import { TDbContext } from "../db/drizzle";
import {
  auditLogs,
  disclosureDetails,
  disclosureProperties,
  disclosures,
  employees,
  patientsPhoneNumbers,
} from "../db/schema";
import { and, eq, inArray, InferInsertModel } from "drizzle-orm";
import { AuditLogRepo } from "../repos/audit-log.repo";
import { deleteAudioFile, isDbError, saveAudioFile } from "../db/helpers";
import { DisclosureConsultationRepo } from "../repos/disclosure-consultation.repo";
import { NotificationService } from "./notification.service";
import { TAddNotificationDto } from "../types/notification.type";
import { rowsToExcel } from "../libs/xlsx";
import localization from "../constants/localization.json";
import { generateRandomNumberStr, isNullOrUndefined } from "../helpers";
import { PG_ERROR_CODES } from "../constants/pg-errors";

@injectable()
export class DisclosureService {
  constructor(
    @inject(DisclosureRepo) private disclosureRepo: DisclosureRepo,
    @inject(DisclosureConsultationRepo)
    private consultationRepo: DisclosureConsultationRepo,
    @inject("db") private db: TDbContext,
    @inject(AuditLogRepo)
    private auditLogRepo: AuditLogRepo,
    @inject(NotificationService)
    private notificationService: NotificationService,
  ) {}

  async getDisclosureById(id: string) {
    const result = await this.disclosureRepo.getByIdWithIncludes(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  async addDisclosure(dto: TAddDisclosureDto) {
    return await this.db.transaction(async (tx) => {
      const [newDisclosure] = await this.disclosureRepo.create(dto, tx as any);

      // If a scout is assigned, notify them
      if (newDisclosure.scoutId && dto.createdBy) {
        await this.notificationService.sendNotification(
          [
            {
              from: dto.createdBy,
              to: newDisclosure.scoutId,
              type: "disclosure_assigned",
              recordId: newDisclosure.id,
            },
          ],
          tx as any,
        );
      }

      return newDisclosure;
    });
  }

  searchDisclosures(dto: TFilterDisclosuresDto) {
    return this.disclosureRepo.findManyWithIncludesPaginated(dto);
  }

  async updateDisclosure(
    id: string,
    updatedBy: string,
    dto: Partial<TDisclosure>,
  ) {
    await this.db.transaction(async (tx) => {
      const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

      const oldDisclosure = await tx.query.disclosures.findFirst({
        where: eq(disclosures.id, id),
      });

      if (!oldDisclosure) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      if (dto.visitResult === "cant_be_completed") {
        dto.status = "suspended";
      }

      if (
        (dto.visitResult === null || dto.visitResult === "not_completed") &&
        oldDisclosure.status === "suspended"
      ) {
        dto.status = "active";
      }

      if ("visitResult" in dto) {
        dto.lastVisitDate = new Date().toISOString();
      }

      const [updatedDisclosure] = await this.disclosureRepo.update(
        {
          ...dto,
          id,
          updatedBy,
        },
        tx as any,
      );

      const auditCreatedAt = new Date().toISOString();

      const auditProperties: (keyof typeof oldDisclosure)[] = [
        "type",
        "scoutId",
        "priorityId",
        "initialNote",
        // VISIT
        "visitResult",
        "visitReason",
        "visitNote",
        // RATING
        "ratingId",
        "ratingNote",
        "isCustomRating",
        "customRating",
        // APPOINTMENT
        "appointmentDate",
        "isAppointmentCompleted",
        // RECEVIED AND ARCHIVE NUMBER
        "status",
        "isReceived",
        "archiveNumber",
      ];

      auditProperties.forEach((property) => {
        if (
          oldDisclosure[property] !== updatedDisclosure[property] ||
          // always audit visitResult even when the value hasn't changed
          ("visitResult" in dto && property === "visitResult")
        ) {
          auditsToAdd.push({
            recordId: id,
            column: disclosures[property].name,
            action: "UPDATE",
            createdBy: updatedBy,
            newValue: !isNullOrUndefined(updatedDisclosure[property])
              ? String(updatedDisclosure[property])
              : null,
            oldValue: !isNullOrUndefined(oldDisclosure[property])
              ? String(oldDisclosure[property])
              : null,
            table: "disclosures",
            createdAt: auditCreatedAt,
          });
        }
      });

      if (auditsToAdd.length)
        await this.auditLogRepo.create(auditsToAdd, tx as any);
    });
  }

  async getDisclosureNotes(dto: TGetDisclosureNotesDto) {
    return await this.disclosureRepo.getDisclosureNotes(dto);
  }

  async getDisclosureNote(id: string) {
    return await this.disclosureRepo.getDisclosureNote(id);
  }

  async addDisclsoureNote(dto: TAddDisclosureNoteDto) {
    const { audioFile, ...rest } = dto;
    await this.db.transaction(async (tx) => {
      let noteAudio;

      if (audioFile) {
        noteAudio = await saveAudioFile(audioFile);
      }

      const [addedNote] = await this.disclosureRepo.addDisclosureNote(
        { ...rest, noteAudio },
        tx as any,
      );

      if (addedNote) {
        await this.auditLogRepo.create([
          {
            recordId: addedNote.id,
            table: "disclosure_notes",
            action: "INSERT",
            createdBy: addedNote.createdBy,
          },
        ]);
      }
    });
  }

  async updateDisclsoureNote(dto: TUpdateDisclosureNoteDto) {
    await this.db.transaction(async (tx) => {
      const {
        audioFile,
        deleteAudioFile: _deleteAudioFile,
        updatedBy,
        ...rest
      } = dto;

      const oldNote = await this.disclosureRepo.getDisclosureNote(dto.id);

      if (!oldNote) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      if ((oldNote.createdBy as any).id !== updatedBy)
        throw new ForbiddenError(ERROR_CODES.FORBIDDEN_ACTION);

      let noteAudio = oldNote.noteAudio || undefined;

      if (_deleteAudioFile === "true" || audioFile) {
        if (oldNote.noteAudio) {
          try {
            await deleteAudioFile(oldNote.noteAudio);
          } catch {}
        }
      }

      if (audioFile) {
        noteAudio = await saveAudioFile(audioFile);
      }

      const [updatedNote] = await this.disclosureRepo.updateDisclosureNote(
        { ...rest, noteAudio },
        tx as any,
      );

      if (updatedNote) {
        const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

        if (oldNote.noteText !== updatedNote.noteText)
          auditsToAdd.push({
            recordId: updatedNote.id,
            table: "disclosure_notes",
            column: "note_text",
            action: "UPDATE",
            newValue: updatedNote.noteText || null,
            oldValue: oldNote.noteText || null,
            createdBy: updatedNote.createdBy,
          });
        if (oldNote.noteAudio !== updatedNote.noteAudio) {
          auditsToAdd.push({
            recordId: updatedNote.id,
            table: "disclosure_notes",
            column: "note_audio",
            action: "UPDATE",
            newValue: updatedNote.noteAudio || null,
            oldValue: oldNote.noteAudio || null,
            createdBy: updatedNote.createdBy,
          });
        }

        // await this.auditLogRepo.create([,]);
      }
    });
  }

  async getDisclosureAuditLogsGroupedByDate(dto: TGetDisclosureAuditLogsDto) {
    return await this.auditLogRepo.getDisclosureAuditLogsGroupedByDatePaginated(
      dto,
    );
  }

  async getDisclosureAuditLogsByDate(disclosureId: string, date: string) {
    return await this.auditLogRepo.getDisclosureAuditLogByDateWithIncludes(
      disclosureId,
      date,
    );
  }

  async moveDisclosures(dto: TMoveDisclosuresDto, updatedBy: string) {
    await this.db.transaction(async (tx) => {
      const updatedDisclosures = await this.disclosureRepo.moveDisclosures(dto);
      if (updatedDisclosures.length > 0) {
        const auditCreatedAt = new Date().toISOString();

        const auditsToAdd: InferInsertModel<typeof auditLogs>[] =
          updatedDisclosures.map((disclosure) => ({
            recordId: disclosure.id,
            column: disclosures.scoutId.name,
            action: "UPDATE",
            createdBy: updatedBy,
            newValue: dto.toScoutId,
            oldValue: dto.fromScoutId,
            table: "disclosures",
            createdAt: auditCreatedAt,
          }));

        await this.auditLogRepo.create(auditsToAdd, tx as any);

        // Notify the new scout for each disclosure assigned to them (bulk operation)
        const notifications: TAddNotificationDto[] = updatedDisclosures.map(
          (disclosure) => ({
            from: updatedBy,
            to: dto.toScoutId,
            type: "disclosure_assigned",
            recordId: disclosure.id,
          }),
        );

        await this.notificationService.sendBulkNotifications(
          notifications,
          tx as any,
        );
      }

      return updatedDisclosures.length;
    });
  }

  async addDisclosureConsultation(dto: TAddDisclosureConsultationDto) {
    const { consultationAudioFile, ...rest } = dto;

    await this.db.transaction(async (tx) => {
      let consultationAudioUUID = undefined;

      if (consultationAudioFile) {
        consultationAudioUUID = await saveAudioFile(consultationAudioFile);
      }

      const [addedConsultation] = await this.consultationRepo.create(
        {
          ...rest,
          consultationAudio: consultationAudioUUID,
        },
        tx as any,
      );

      const employeesThatCanBeConsulted = await tx
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.role, "manager"),
            eq(employees.canBeConsulted, true),
          ),
        );

      await this.notificationService.sendNotificationToIds(
        {
          from: addedConsultation.createdBy!,
          type: "consultation_requested",
          recordId: addedConsultation.id,
          ids: employeesThatCanBeConsulted.map((i) => i.id),
        },
        tx as any,
      );
    });
  }
  // CONSULTATIONS
  async updateDisclosureConsultation(dto: TUpdateDisclosureConsultationDto) {
    const {
      deleteAudioFile: _deleteAudioFile,
      consultationAudioFile,
      ...rest
    } = dto;
    await this.db.transaction(async (tx) => {
      const oldConsultation = await this.consultationRepo.getById(dto.id);

      let consultationAudio = oldConsultation?.consultationAudio || undefined;

      if (!oldConsultation)
        throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      if (_deleteAudioFile === "true" || consultationAudioFile) {
        if (oldConsultation.consultationAudio) {
          try {
            await deleteAudioFile(oldConsultation.consultationAudio);
          } catch {}
        }
      }

      if (consultationAudioFile) {
        consultationAudio = await saveAudioFile(consultationAudioFile);
      }

      await this.consultationRepo.update(
        { ...rest, consultationAudio },
        tx as any,
      );
    });
  }

  getDisclosureConsultations(dto: TGetDisclosureConsultationsDto) {
    return this.consultationRepo.findManyWithIncludesPaginated(dto);
  }

  async getDisclosureConsultation(id: string) {
    const result = await this.consultationRepo.getByIdWithIncludes(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  async completeConsultation(dto: TCompleteDisclosureConsultationsDto) {
    const {
      id,
      ratingId,
      isCustomRating,
      customRating,
      ratingNote,
      updatedBy,
    } = dto;
    const consultation = await this.consultationRepo.getById(id);

    if (!consultation) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

    await this.db.transaction(async (tx) => {
      // Update the disclosure with rating information directly
      await this.updateDisclosure(consultation.disclosureId, updatedBy, {
        ratingId,
        isCustomRating,
        customRating,
        ratingNote,
        updatedBy,
        visitResult: "completed",
      });

      await this.consultationRepo.update(
        {
          ...consultation,
          consultationStatus: "completed",
          consultedBy: updatedBy,
          updatedBy,
        },
        tx as any,
      );

      // Notify the scout who requested the consultation
      await this.notificationService.sendNotification(
        [
          {
            from: updatedBy,
            to: consultation.createdBy!,
            type: "consultation_completed",
            recordId: consultation.id,
          },
        ],
        tx as any,
      );
    });
  }

  async getAppointments(dto: TGetDisclosureAppointmentsDto) {
    return this.disclosureRepo.getAppointments(dto);
  }

  async getDateAppointments(dto: TGetDateAppointmentsDto) {
    return this.disclosureRepo.getDateAppointments(dto);
  }

  async getLastDisclosureByPatientId(patientId: string) {
    return this.disclosureRepo.getLastDisclosureByPatientId(patientId);
  }

  async getDisclosureDetails(disclosureId: string) {
    return this.disclosureRepo.getDisclosureDetails(disclosureId);
  }

  async addDisclosureDetails(dto: TAddDisclosureDetailsDto) {
    return this.disclosureRepo.addDisclosureDetails(dto);
  }

  async updateDisclosureDetails(dto: TUpdateDisclosureDetailsDto) {
    await this.db.transaction(async (tx) => {
      const oldDisclosureDetails = await tx.query.disclosureDetails.findFirst({
        where: eq(disclosureDetails.disclosureId, dto.disclosureId),
      });

      if (!oldDisclosureDetails)
        throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      const [updatedDisclosureDetails] =
        await this.disclosureRepo.updateDisclosureDetails(dto, tx as any);

      const auditCreatedAt = new Date().toISOString();

      const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

      const auditProperties: (keyof typeof oldDisclosureDetails)[] = [
        "diseasesOrSurgeries",
        "jobOrSchool",
        "electricity",
        "expenses",
        "houseOwnership",
        "houseOwnershipNote",
        "houseCondition",
        "houseConditionNote",
        "pros",
        "cons",
        "other",
      ];

      auditProperties.forEach((property) => {
        if (
          oldDisclosureDetails[property] !== updatedDisclosureDetails[property]
        ) {
          auditsToAdd.push({
            recordId: dto.disclosureId,
            column: disclosureDetails[property].name,
            action: "UPDATE",
            createdBy: dto.updatedBy,
            newValue: updatedDisclosureDetails[property] || null,
            oldValue: oldDisclosureDetails[property] || null,
            table: "disclosure_details",
            createdAt: auditCreatedAt,
          });
        }
      });

      if (auditsToAdd.length)
        await this.auditLogRepo.create(auditsToAdd, tx as any);
    });

    return this.disclosureRepo.updateDisclosureDetails(dto);
  }

  async archiveDisclosure(
    id: string,
    updatedBy: string,
    manualArchiveNumber?: string,
  ) {
    await this.db.transaction(async (tx) => {
      try {
        const oldDisclosure = await tx.query.disclosures.findFirst({
          where: eq(disclosures.id, id),
        });

        if (!oldDisclosure)
          throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

        if (oldDisclosure.status === "archived") {
          throw new ForbiddenError(ERROR_CODES.FORBIDDEN_ACTION);
        }

        let archiveNumber: undefined | string = undefined;

        const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

        const createdAt = new Date().toISOString();

        if (
          (manualArchiveNumber && !oldDisclosure.archiveNumber) ||
          (manualArchiveNumber &&
            oldDisclosure.archiveNumber &&
            manualArchiveNumber !== oldDisclosure.archiveNumber)
        ) {
          archiveNumber = manualArchiveNumber;

          await this.disclosureRepo.update(
            {
              id,
              status: "archived",
              archiveNumber,
              updatedBy,
            },
            tx as any,
          );
        } else {
          while (true) {
            archiveNumber = generateRandomNumberStr();
            try {
              await this.disclosureRepo.update(
                {
                  id,
                  status: "archived",
                  archiveNumber,
                  updatedBy,
                },
                tx as any,
              );

              break;
            } catch (err: any) {
              if (err?.code === PG_ERROR_CODES.UNIQUE_CONSTRAINT) {
                continue;
              }
              throw err;
            }
          }
        }

        if (archiveNumber !== oldDisclosure.archiveNumber)
          auditsToAdd.push({
            recordId: id,
            column: disclosures.archiveNumber.name,
            action: "UPDATE",
            createdBy: updatedBy,
            newValue: archiveNumber,
            oldValue: null,
            table: "disclosures",
            createdAt,
          });

        auditsToAdd.push({
          recordId: id,
          column: disclosures.status.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: "archived",
          oldValue: oldDisclosure.status,
          table: "disclosures",
          createdAt,
        });

        await this.auditLogRepo.create(auditsToAdd, tx as any);
      } catch (error: any) {
        if (
          isDbError(error) &&
          (error.cause as any)?.code === PG_ERROR_CODES.UNIQUE_CONSTRAINT
        ) {
          throw new ConflictError(ERROR_CODES.DUPLICATE_ARCHIVE_NUMBER);
        } else {
          throw error;
        }
      }
    });
  }

  async unarchiveDisclosure(id: string, updatedBy: string) {
    await this.db.transaction(async (tx) => {
      const oldDisclosure = await tx.query.disclosures.findFirst({
        where: eq(disclosures.id, id),
      });

      if (!oldDisclosure) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      if (oldDisclosure.status !== "archived") {
        throw new ForbiddenError(ERROR_CODES.FORBIDDEN_ACTION);
      }

      await this.disclosureRepo.update(
        {
          id,
          status: "active",
          updatedBy,
          // archiveNumber: null,
        },
        tx as any,
      );

      // Create audit log
      await this.auditLogRepo.create(
        [
          {
            recordId: id,
            column: disclosures.status.name,
            action: "UPDATE",
            createdBy: updatedBy,
            newValue: "active",
            oldValue: "archived",
            table: "disclosures",
            createdAt: new Date().toISOString(),
          },
        ],
        tx as any,
      );
    });
  }

  async exportToExcel(dto: TFilterDisclosuresDto) {
    const result = await this.disclosureRepo.findManyWithIncludesPaginated({
      ...dto,
      pageSize: Number.MAX_SAFE_INTEGER,
    });
    const patientIds = result.items.map((i) => i.patientId);

    const phoneNumbers = await this.db.query.patientsPhoneNumbers.findMany({
      where: inArray(patientsPhoneNumbers.patientId, patientIds),
    });

    const areas = await this.db.query.areas.findMany();
    const areasDic = areas.reduce(
      (acc, curr) => {
        acc[curr.id] = curr.name;
        return acc;
      },
      {} as Record<string, string>,
    );
    const normalizedResult = result.items.map((i) => {
      const {
        patient,
        initialNote,
        // updatedBy,
        // createdBy,
        // priority,
        // rating,
        // scout,
        // customRating,
        // isCustomRating,
        // // patientId,
        // // priorityId,
        // // ratingId,
        // // id,
        // // scoutId,
        type,
        // status,
        // initialNote,
        // isReceived,
        // visitNote,
        // visitReason,
        // visitResult,
        // ratingNote,
        // appointmentDate,
        // isAppointmentCompleted,
        // archiveNumber,
        // createdAt,
        // updatedAt,
      } = i;

      const patientPhoneNumbers = phoneNumbers
        .filter((pn) => pn.patientId === patient.id)
        .map((pn) => pn.phone)
        .join(", ");

      const patientArea = areasDic[patient.areaId as keyof typeof areasDic];
      const dtoToBePrinted = {
        [localization["disclosure.excel.name"]]: patient.name,
        [localization["disclosure.excel.type"]]:
          localization[`disclosure.excel.${type}`],
        [localization["disclosure.excel.phones"]]: patientPhoneNumbers,
        [localization["disclosure.excel.area"]]: patientArea,
        [localization["disclosure.excel.address"]]: patient.address,
        [localization["disclosure.excel.initial_note"]]: initialNote,
        // [localization["disclosure.excel.priority"]]: priority.name,
        // [localization["disclosure.excel.status"]]:
        //   localization[`disclosure.excel.${status}`],
        // [localization["disclosure.excel.initial_note"]]: initialNote ?? "",
        // [localization["disclosure.excel.scout"]]: (scout as any)?.name,
        // [localization["disclosure.excel.visit_status"]]: visitResult
        //   ? localization[`disclosure.excel.${visitResult}`]
        //   : localization["disclosure.excel.none"],
        // [localization["disclosure.excel.visit_reason"]]: visitReason ?? "",
        // [localization["disclosure.excel.visit_note"]]: visitNote ?? "",
        // [localization["disclosure.excel.rating"]]:
        //   (isCustomRating
        //     ? `( ${localization["disclosure.excel.rating_custom"]} ) - ${customRating}`
        //     : rating
        //       ? `( ${rating.code} ) - ${rating.name}`
        //       : "") || "",
        // [localization["disclosure.excel.rating_note"]]: ratingNote ?? "",
        // [localization["disclosure.excel.appointment_date"]]:
        //   appointmentDate ?? "",
        // [localization["disclosure.excel.appointment_status"]]:
        //   isAppointmentCompleted ? localization["disclosure.excel.done"] : "",
        // [localization["disclosure.excel.receive_status"]]: isReceived
        //   ? localization["disclosure.excel.done"]
        //   : "",
        // [localization["disclosure.excel.archive_number"]]: archiveNumber ?? "",
        // [localization["disclosure.excel.created_by"]]: (createdBy as any)?.name,
        // [localization["disclosure.excel.created_at"]]:
        //   formatDateTime(createdAt),
        // [localization["disclosure.excel.updated_by"]]: (updatedBy as any)?.name,
        // [localization["disclosure.excel.updated_at"]]: updatedAt
        //   ? formatDateTime(updatedAt)
        //   : "",
      };
      return dtoToBePrinted;
    });
    const excelFileName = await rowsToExcel(normalizedResult);
    const file = Bun.file(excelFileName);

    const fileArrayBuffer = await file.arrayBuffer();
    const contentType = file.type;

    await file.delete();

    return new Response(fileArrayBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  }

  async getDisclosureSubPatientById(id: string) {
    return this.disclosureRepo.getDisclosureSubPatientById(id);
  }
  async getDisclosureSubPatients(disclosureId: string) {
    return this.disclosureRepo.getDisclosureSubPatients(disclosureId);
  }

  async addDisclosureSubPatient(dto: TAddSubPatientDto) {
    return this.disclosureRepo.addDislcosureSubPatient(dto);
  }
  async updateDisclosureSubPatient(dto: TUpdateSubPatientDto) {
    return this.disclosureRepo.updateDisclosureSubPatient(dto);
  }
  async deleteDisclosureSubPatient(id: string) {
    return this.disclosureRepo.deleteDisclosureSubPatient(id);
  }

  async getDisclosureProperties(disclosureId: string) {
    return this.disclosureRepo.getDisclosureProperties(disclosureId);
  }

  async addDisclosureProperties(dto: TAddDisclosurePropertiesDto) {
    const { audioFile, ...rest } = dto;
    await this.db.transaction(async (tx) => {
      let audio;

      if (audioFile) {
        audio = await saveAudioFile(audioFile);
      }

      const [addedDisclosureProperties] =
        await this.disclosureRepo.addDisclosureProperties(
          { ...rest, audio },
          tx as any,
        );
      if (addedDisclosureProperties) {
        const auditCreatedAt = new Date().toISOString();

        const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

        const auditProperties: (keyof typeof addedDisclosureProperties)[] = [
          "pros",
          "cons",
          "meds",
          "note",
          "audio",
        ];

        auditProperties.forEach((property) => {
          auditsToAdd.push({
            recordId: dto.disclosureId,
            column: disclosureProperties[property].name,
            action: "INSERT",
            createdBy: dto.createdBy,
            newValue: addedDisclosureProperties[property] || null,
            oldValue: null,
            table: "disclosure_properties",
            createdAt: auditCreatedAt,
          });
        });
        if (auditsToAdd.length)
          await this.auditLogRepo.create(auditsToAdd, tx as any);
      }
    });
  }

  async updateDisclosureProperties(dto: TUpdateDisclosurePropertiesDto) {
    await this.db.transaction(async (tx) => {
      const { audioFile, deleteAudioFile: _deleteAudioFile, ...rest } = dto;

      const oldDisclosureProperties =
        await tx.query.disclosureProperties.findFirst({
          where: eq(disclosureProperties.disclosureId, dto.disclosureId),
        });

      if (!oldDisclosureProperties)
        throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      let audio: string | null | undefined =
        oldDisclosureProperties.audio || undefined;

      if (_deleteAudioFile === "true" || audioFile) {
        if (oldDisclosureProperties.audio) {
          try {
            await deleteAudioFile(oldDisclosureProperties.audio);
          } catch {}
        }
        audio = null;
      }

      if (audioFile) {
        audio = await saveAudioFile(audioFile);
      }

      const [updatedDisclosureProperties] =
        await this.disclosureRepo.updateDisclosureProperties(
          { ...rest, audio },
          tx as any,
        );

      if (updatedDisclosureProperties) {
        const auditCreatedAt = new Date().toISOString();

        const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

        const auditProperties: (keyof typeof oldDisclosureProperties)[] = [
          "pros",
          "cons",
          "meds",
          "note",
          "audio",
        ];

        auditProperties.forEach((property) => {
          if (
            oldDisclosureProperties[property] !==
            updatedDisclosureProperties[property]
          ) {
            auditsToAdd.push({
              recordId: dto.disclosureId,
              column: disclosureProperties[property].name,
              action: "UPDATE",
              createdBy: dto.updatedBy,
              newValue: updatedDisclosureProperties[property] || null,
              oldValue: oldDisclosureProperties[property] || null,
              table: "disclosure_properties",
              createdAt: auditCreatedAt,
            });
          }
        });
        if (auditsToAdd.length)
          await this.auditLogRepo.create(auditsToAdd, tx as any);
      }
    });
  }
}
