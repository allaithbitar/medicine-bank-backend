import { utils, writeFile, set_fs } from "xlsx";
import * as fs from "fs";

export function rowsToExcel<T>(rows: T[]) {
  const worksheet = utils.json_to_sheet(rows);

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "data");

  set_fs(fs);

  writeFile(workbook, "data.xlsx", { compression: true });
}
