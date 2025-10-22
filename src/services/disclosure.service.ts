import "reflect-metadata";
import { inject, injectable } from "inversify";
import { DisclosureRepo } from "../repos/disclosure.repo";
import {
  TAddDisclosureDto,
  TAddDisclosureNoteDto,
  TAddDisclosureRatingDto,
  TAddDisclosureVisitDto,
  TDisclosure,
  TFilterDisclosuresDto,
  TGetDisclosureAuditLogsDto,
  TGetDisclosureNotesDto,
  TGetDisclosureRatingsDto,
  TGetDisclosureVisitsDto,
  TMoveDisclosuresDto,
  TUpdateDisclosureNoteDto,
  TUpdateDisclosureRatingDto,
  TUpdateDisclosureVisitDto,
} from "../types/disclosure.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";
import { TDbContext } from "../db/drizzle";
import {
  auditLogs,
  disclosures,
  disclosuresToRatings,
  visits,
} from "../db/schema";
import { eq, InferInsertModel } from "drizzle-orm";
import { AuditLogRepo } from "../repos/audit-log.repo";
@injectable()
export class DisclosureService {
  constructor(
    @inject(DisclosureRepo) private disclosureRepo: DisclosureRepo,
    @inject("db") private db: TDbContext,
    @inject(AuditLogRepo)
    private auditLogRepo: AuditLogRepo,
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
    await this.db.transaction(async (tx) => {
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

  getDisclosureVisits(dto: TGetDisclosureVisitsDto) {
    return this.disclosureRepo.getDisclosureVisits(dto);
  }

  async getDisclosureVisit(id: string) {
    const result = await this.disclosureRepo.getDisclosureVisit(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }

  async addDisclosureVisit(dto: TAddDisclosureVisitDto) {
    await this.db.transaction(async (tx) => {
      const [addedVisit] = await this.disclosureRepo.addDisclosureVisit(
        dto,
        tx as any,
      );
      if (addedVisit) {
        await this.auditLogRepo.create(
          [
            {
              recordId: addedVisit.id,
              table: "visits",
              action: "INSERT",
              createdBy: addedVisit.createdBy,
            },
          ],
          tx as any,
        );
      }
    });
  }

  async updateDisclosureVisit(dto: TUpdateDisclosureVisitDto) {
    await this.db.transaction(async (tx) => {
      const auditsToAdd: InferInsertModel<typeof auditLogs>[] = [];

      const oldVisit = await this.disclosureRepo.getDisclosureVisit(dto.id);

      if (!oldVisit) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      const [updatedVisit] = await this.disclosureRepo.updateDislosureVisit(
        dto,
        tx as any,
      );

      if (updatedVisit) {
        const auditCreatedAt = new Date().toISOString();

        if (oldVisit.result !== updatedVisit.result) {
          auditsToAdd.push({
            recordId: updatedVisit.id,
            table: "visits",
            action: "UPDATE",
            column: visits.result.name,
            newValue: updatedVisit.result,
            oldValue: oldVisit.result,
            createdBy: updatedVisit.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (oldVisit.reason !== updatedVisit.reason) {
          auditsToAdd.push({
            recordId: updatedVisit.id,
            table: "visits",
            action: "UPDATE",
            column: visits.reason.name,
            newValue: updatedVisit.reason,
            oldValue: oldVisit.reason,
            createdBy: updatedVisit.updatedBy,
            createdAt: auditCreatedAt,
          });
        }

        if (oldVisit.note !== updatedVisit.note) {
          auditsToAdd.push({
            recordId: updatedVisit.id,
            table: "visits",
            action: "UPDATE",
            column: visits.note.name,
            newValue: updatedVisit.note,
            oldValue: oldVisit.note,
            createdBy: updatedVisit.updatedBy,
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

  async getDisclosuresVisits() {
    return await this.disclosureRepo.getDisclosuresVisits();
  }

  async getDisclosureNotes(dto: TGetDisclosureNotesDto) {
    return await this.disclosureRepo.getDisclosureNotes(dto);
  }

  async getDisclosureNote(id: string) {
    return await this.disclosureRepo.getDisclosureNote(id);
  }

  async addDisclsoureNote(dto: TAddDisclosureNoteDto) {
    await this.db.transaction(async (tx) => {
      const [addedNote] = await this.disclosureRepo.addDisclosureNote(
        dto,
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
      const oldNote = await this.disclosureRepo.getDisclosureNote(dto.id);

      if (!oldNote) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);

      const [updatedNote] = await this.disclosureRepo.updateDisclosureNote(
        dto,
        tx as any,
      );

      if (updatedNote) {
        if (oldNote.note !== updatedNote.note)
          await this.auditLogRepo.create([
            {
              recordId: updatedNote.id,
              table: "disclosure_notes",
              column: "note",
              action: "UPDATE",
              newValue: updatedNote.note,
              oldValue: oldNote.note,
              createdBy: updatedNote.createdBy,
            },
          ]);
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
}
