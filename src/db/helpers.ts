// export function withPagination<T extends PgSelect>(
//   qb: T,
//   pageNumber: number = 0,
//   pageSize: number = 10,
// ) {
//   return qb.limit(pageSize).offset(pageNumber * pageSize);
// }

import { DatabaseError } from "pg";
import { TSystemError } from "../types/common.types";
import {
  DB_CONSTRAINT_ERRORS,
  PG_ERROR_CODES,
  Unhandled_Db_Error,
} from "../constants/pg-errors";
import { Column, SQL, sql, SQLWrapper } from "drizzle-orm";

export const isDbError = (error: any): error is DatabaseError => {
  if ("cause" in error && "code" in error.cause) {
    return true;
  }
  return false;
};

export const transformDbError = (error: any): DatabaseError => {
  return error.cause;
};

export const getReadableDbErrorMessage = (
  error: DatabaseError,
): TSystemError => {
  if (error.code === PG_ERROR_CODES.UNIQUE_CONSTRAINT && !!error.constraint) {
    const errorToReturn =
      DB_CONSTRAINT_ERRORS[
        error.constraint as keyof typeof DB_CONSTRAINT_ERRORS
      ];
    if (errorToReturn) {
      if ("var" in errorToReturn) {
        const duplicatedValue =
          (error.detail ?? "").match(/\(([^)]+)\)/g)?.[1] ?? "";

        errorToReturn.en = errorToReturn.en.replace(
          `{${errorToReturn.var}}`,
          duplicatedValue,
        );
        errorToReturn.ar = errorToReturn.ar.replace(
          `{${errorToReturn.var}}`,
          duplicatedValue,
        );
        delete (errorToReturn as any).var;
      }
      return errorToReturn;
    }

    return { ...Unhandled_Db_Error, details: error };
  }
  return { ...Unhandled_Db_Error, details: error };
};

export function getRandomArrayItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export const saveAudioFile = async (file: File) => {
  let audioName =
    Bun.randomUUIDv7() + file.name.slice(file.name.lastIndexOf("."));
  const buffer = await file.arrayBuffer();

  await Bun.write(`public/audio/${audioName}`, buffer, {
    createPath: true,
  });
  return audioName;
};

export const deleteAudioFile = async (name: string) => {
  const oldAudioFile = Bun.file(`public/audio/${name}`);
  if (oldAudioFile) {
    await oldAudioFile.delete();
  }
};

export function searchArabic(source: Column, text: string): SQL {
  let normalizedText = text
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
  normalizedText = `%${normalizedText}%`;
  return sql`normalize_arabic(${source}) ILIKE normalize_arabic(${normalizedText})`;
}
