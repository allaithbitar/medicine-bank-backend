import { TDbContext } from "../db/drizzle";

interface IGenericRepo<T, CreateDto, UpdateDto, FilterDto, IncludesDto> {
  create(createDto: CreateDto, tx?: TDbContext): Promise<void>;
  findById(id: string): Promise<T | undefined>;
  findByIdWithIncludes(id: string): Promise<(T & IncludesDto) | undefined>;
  findMany(filterDto?: FilterDto): Promise<T[]>;
  findManyWithIncludes(filterDto?: FilterDto): Promise<(T & IncludesDto)[]>;
  update(id: string, updateDto: UpdateDto, tx?: TDbContext): Promise<void>;
  delete(id: string, tx?: TDbContext): Promise<boolean>;
}

export default IGenericRepo;
