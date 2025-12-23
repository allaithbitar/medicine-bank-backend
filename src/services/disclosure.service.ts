import "reflect-metadata";
import { inject, injectable } from "inversify";
import { DisclosureRepo } from "../repos/disclosure.repo";
import {
  TAddDisclosureConsultationDto,
  TAddDisclosureDto,
  TAddDisclosureNoteDto,
  TAddDisclosureRatingDto,
  TCompleteDisclosureConsultationsDto,
  TDisclosure,
  TFilterDisclosuresDto,
  TGetDisclosureAuditLogsDto,
  TGetDisclosureConsultationsDto,
  TGetDisclosureNotesDto,
  TGetDisclosureRatingsDto,
  TMoveDisclosuresDto,
  TUpdateDisclosureConsultationDto,
  TUpdateDisclosureNoteDto,
  TUpdateDisclosureRatingDto,
} from "../types/disclosure.type";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "../constants/errors";
import { TDbContext } from "../db/drizzle";
import { auditLogs, disclosures, disclosuresToRatings } from "../db/schema";
import { eq, InferInsertModel } from "drizzle-orm";
import { AuditLogRepo } from "../repos/audit-log.repo";
import { deleteAudioFile, saveAudioFile } from "../db/helpers";
import { DisclosureConsultationRepo } from "../repos/disclosure-consultation.repo";
import { NotificationRepo } from "../repos/notification.repo";
@injectable()
export class DisclosureService {
  constructor(
    @inject(DisclosureRepo) private disclosureRepo: DisclosureRepo,
    @inject(DisclosureConsultationRepo)
    private consultationRepo: DisclosureConsultationRepo,
    @inject("db") private db: TDbContext,
    @inject(AuditLogRepo)
    private auditLogRepo: AuditLogRepo,
    @inject(NotificationRepo)
    private notificationRepo: NotificationRepo,
  ) {}

  getDisclosureById(id: string) {
    return this.disclosureRepo.getByIdWithIncludes(id);
  }

  addDisclosure(dto: TAddDisclosureDto) {
    return this.disclosureRepo.create(dto);
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

      const [updatedDisclosure] = await this.disclosureRepo.update(
        {
          ...dto,
          id,
          updatedBy,
        },
        tx as any,
      );

      const auditCreatedAt = new Date().toISOString();

      // STATUS
      if (oldDisclosure.status !== updatedDisclosure.status) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.status.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.status,
          oldValue: oldDisclosure.status,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      // SCOUT
      if (oldDisclosure.scoutId !== updatedDisclosure.scoutId) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.scoutId.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.scoutId,
          oldValue: oldDisclosure.scoutId,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      // PRIORITY
      if (oldDisclosure.priorityId !== updatedDisclosure.priorityId) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.priorityId.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.priorityId,
          oldValue: oldDisclosure.priorityId,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      // Visit
      if (oldDisclosure.visitNote !== updatedDisclosure.visitNote) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.visitNote.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.visitNote,
          oldValue: oldDisclosure.visitNote,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      if (oldDisclosure.visitReason !== updatedDisclosure.visitReason) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.visitReason.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.visitReason,
          oldValue: oldDisclosure.visitReason,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      if (oldDisclosure.visitResult !== updatedDisclosure.visitResult) {
        auditsToAdd.push({
          recordId: id,
          column: disclosures.visitResult.name,
          action: "UPDATE",
          createdBy: updatedBy,
          newValue: updatedDisclosure.visitResult,
          oldValue: oldDisclosure.visitResult,
          table: "disclosures",
          createdAt: auditCreatedAt,
        });
      }

      if (auditsToAdd.length)
        await this.auditLogRepo.create(auditsToAdd, tx as any);
    });
  }

  getDisclosureRatings(dto: TGetDisclosureRatingsDto) {
    return this.disclosureRepo.getDislosureRatings(dto);
  }

  async getDisclosureRating(id: string) {
    const result = await this.disclosureRepo.getDisclosureRating(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  async addDisclosureRating(dto: TAddDisclosureRatingDto) {
    return await this.db.transaction(async (tx) => {
      const [addedRating] = await this.disclosureRepo.addDisclosureRating(
        dto,
        tx as any,
      );
      if (addedRating) {
        await this.auditLogRepo.create(
          [
            {
              recordId: addedRating.id,
              table: "disclosures_to_ratings",
              action: "INSERT",
              createdBy: addedRating.createdBy,
            },
          ],
          tx as any,
        );
      }
      return addedRating;
    });
  }

  async updateDisclosureRating(dto: TUpdateDisclosureRatingDto) {
    await this.db.transaction(async (tx) => {
      const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

      const oldRating = await this.disclosureRepo.getDislosureRating(dto.id);

      if (!oldRating) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      const [updatedRating] = await this.disclosureRepo.updateDislosureRating(
        dto,
        tx as any,
      );

      if (updatedRating) {
        const auditCreatedAt = new Date().toISOString();

        if (oldRating.ratingId !== updatedRating.ratingId) {
          auditsToAdd.push({
            recordId: updatedRating.id,
            table: "disclosures_to_ratings",
            action: "UPDATE",
            column: disclosuresToRatings.ratingId.name,
            newValue: updatedRating.ratingId,
            oldValue: oldRating.ratingId,
            createdBy: updatedRating.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (oldRating.isCustom !== updatedRating.isCustom) {
          auditsToAdd.push({
            recordId: updatedRating.id,
            table: "disclosures_to_ratings",
            action: "UPDATE",
            column: disclosuresToRatings.isCustom.name,
            newValue: String(updatedRating.isCustom),
            oldValue: String(oldRating.isCustom),
            createdBy: updatedRating.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (oldRating.customRating !== updatedRating.customRating) {
          auditsToAdd.push({
            recordId: updatedRating.id,
            table: "disclosures_to_ratings",
            action: "UPDATE",
            column: disclosuresToRatings.customRating.name,
            newValue: updatedRating.customRating,
            oldValue: oldRating.customRating,
            createdBy: updatedRating.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (oldRating.note !== updatedRating.note) {
          auditsToAdd.push({
            recordId: updatedRating.id,
            table: "disclosures_to_ratings",
            action: "UPDATE",
            column: disclosuresToRatings.note.name,
            newValue: updatedRating.note,
            oldValue: oldRating.note,
            createdBy: updatedRating.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (auditsToAdd.length)
          await this.auditLogRepo.create(auditsToAdd, tx as any);
      }
    });
  }

  async getDisclosuresRatings() {
    return await this.disclosureRepo.getDisclosuresRatings();
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

      let noteAudio = "";

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
            newValue: updatedNote.noteText,
            oldValue: oldNote.noteText,
            createdBy: updatedNote.createdBy,
          });
        if (oldNote.noteAudio !== updatedNote.noteAudio) {
          auditsToAdd.push({
            recordId: updatedNote.id,
            table: "disclosure_notes",
            column: "note_audio",
            action: "UPDATE",
            newValue: updatedNote.noteAudio,
            oldValue: oldNote.noteAudio,
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
      const updatedDisclosures = await this.disclosureRepo.moveDisclosures(
        dto.fromScoutId,
        dto.toScoutId,
      );

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

      await this.consultationRepo.create(
        {
          ...rest,
          consultationAudio: consultationAudioUUID,
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

      let consultationAudio = "";

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
    const result = await this.consultationRepo.getById(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  async completeConsultation(dto: TCompleteDisclosureConsultationsDto) {
    const { id, disclosureRating, createdBy } = dto;
    const consultation = await this.consultationRepo.getById(id);
    if (!consultation) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    await this.db.transaction(async (tx) => {
      const addDisclosureRating = await this.addDisclosureRating({
        ...disclosureRating,
        disclosureId: consultation.disclosureId,
        createdBy: consultation.createdBy!,
      });
      await this.consultationRepo.update(
        {
          ...consultation,
          disclosureRatingId: addDisclosureRating.id,
          consultationStatus: "completed",
          consultedBy: createdBy,
          updatedBy: createdBy,
        },
        tx as any,
      );
      await this.notificationRepo.create({
        from: dto.createdBy,
        to: consultation.createdBy!,
        type: "consultation_completed",
      });
    });
  }
}
