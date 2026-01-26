import { utils, set_fs, writeFileAsync } from "xlsx";
import * as fs from "fs";

export async function rowsToExcel<T>(rows: T[]): Promise<string> {
  return new Promise((res) => {
    const fileName = `excel_${Date.now()}.xlsx`;
    const worksheet = utils.json_to_sheet(rows);
    const colsWidth = Object.keys(rows[0] || {}).map(() => ({ wch: 40 }));
    worksheet["!cols"] = colsWidth;

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "data");

    set_fs(fs);

    writeFileAsync(fileName, workbook, { compression: true }, () => {
      res(fileName);
    });
  });
}
