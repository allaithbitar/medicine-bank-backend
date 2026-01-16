import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { meetings } from "../db/schema";
import { eq, count } from "drizzle-orm";
import {
  TAddMeetingDto,
  TMeeting,
  TFilterMeetingsDto,
  TUpdateMeetingDto,
} from "../types/meeting.type";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";
import { ERROR_CODES, NotFoundError } from "../constants/errors";

@injectable()
export class MeetingRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private async getCount() {
    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(meetings);

    return totalCount;
  }

  async findManyPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
  }: TFilterMeetingsDto): Promise<TPaginatedResponse<TMeeting>> {
    const totalCount = await this.getCount();

    const result = await this.db.query.meetings.findMany({
      limit: pageSize,
      offset: pageSize * pageNumber,
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async findById(id: string): Promise<TMeeting> {
    const res = await this.db.query.meetings.findFirst({
      where: eq(meetings.id, id),
    });
    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
  }

  async create(dto: TAddMeetingDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(meetings).values(dto);
  }

  async update(dto: TUpdateMeetingDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    return await (tx ?? this.db)
      .update(meetings)
      .set(rest)
      .where(eq(meetings.id, id));
  }
}
