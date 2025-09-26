import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { systemBroadcasts } from "../db/schema";
import { eq, count, inArray, and } from "drizzle-orm";
import {
  TAddSystemBroadcastDto,
  TSystemBroadcast,
  TFilterSystemBroadcastsDto,
  TUpdateSystemBroadcastDto,
} from "../types/system-broadcast.type";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";
import { TPaginatedResponse } from "../types/common.types";

@injectable()
export class SystemBroadcastRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ type, audience }: TFilterSystemBroadcastsDto) {
    const typeFilter = type ? eq(systemBroadcasts.type, type) : undefined;
    const audienceFilter = audience?.length
      ? inArray(systemBroadcasts.audience, audience)
      : undefined;
    return {
      typeFilter,
      audienceFilter,
    };
  }

  private async getCount(dto: TFilterSystemBroadcastsDto) {
    const { typeFilter, audienceFilter } = this.getFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(systemBroadcasts)
      .where(and(audienceFilter, typeFilter));

    return totalCount;
  }

  async findManyPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterSystemBroadcastsDto): Promise<
    TPaginatedResponse<TSystemBroadcast>
  > {
    const totalCount = await this.getCount(rest);
    const { typeFilter, audienceFilter } = this.getFilters(rest);

    const result = await this.db.query.systemBroadcasts.findMany({
      where: and(typeFilter, audienceFilter),
      limit: pageSize,
      offset: pageSize * pageNumber,
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async create(dto: TAddSystemBroadcastDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(systemBroadcasts).values(dto);
  }

  async update(dto: TUpdateSystemBroadcastDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    return await (tx ?? this.db)
      .update(systemBroadcasts)
      .set(rest)
      .where(eq(systemBroadcasts.id, id));
  }
}
