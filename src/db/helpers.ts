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

export const getRandomIndex = (arr: any[]) =>
  Math.floor(Math.random() * arr.length);

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
