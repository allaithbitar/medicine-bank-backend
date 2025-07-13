import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { and, eq, ilike } from "drizzle-orm";
import {
  TAddRatingDto,
  TFilterRatingsDto,
  TRating,
  TUpdateRatingDto,
} from "../types/rating.type";
import { ratings } from "../db/schema";

@injectable()
export class RatingRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getFilters({ name, code, description }: TFilterRatingsDto) {
    const nameFilter = name ? ilike(ratings.name, `%${name}%`) : undefined;

    const codeFilter = code ? ilike(ratings.code, `%${name}%`) : undefined;

    const descriptionFilter = description
      ? ilike(ratings.description, `%${name}%`)
      : undefined;

    return {
      nameFilter,
      codeFilter,
      descriptionFilter,
    };
  }

  async findMany(filters: TFilterRatingsDto): Promise<TRating[]> {
    const { nameFilter, codeFilter, descriptionFilter } =
      this.getFilters(filters);

    const result = await this.db.query.ratings.findMany({
      where: and(nameFilter, codeFilter, descriptionFilter),
    });

    return result;
  }

  async create(dto: TAddRatingDto, tx?: TDbContext) {
    await (tx ?? this.db).insert(ratings).values(dto);
  }

  async update(dto: TUpdateRatingDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    await (tx ?? this.db).update(ratings).set(rest).where(eq(ratings.id, id));
  }
}
