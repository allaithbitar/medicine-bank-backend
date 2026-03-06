import { utils, set_fs, writeFileAsync } from "xlsx";
import * as fs from "fs";

export async function rowsToExcel<T>(rows: T[] | any[][]): Promise<string> {
  return new Promise((res) => {
    const fileName = `excel_${Date.now()}.xlsx`;
    let worksheet;

    // If rows is an array of arrays, create sheet from array-of-arrays (aoa)
    if (rows.length && Array.isArray(rows[0])) {
      worksheet = utils.aoa_to_sheet(rows as any[][]);
      const colsWidth = new Array((rows as any[][])[0].length).fill({ wch: 40 });
      worksheet["!cols"] = colsWidth;
    } else {
      worksheet = utils.json_to_sheet(rows as Object[]);
      const colsWidth = Object.keys((rows as any[])[0] || {}).map(() => ({ wch: 40 }));
      worksheet["!cols"] = colsWidth;
    }

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "data");

    set_fs(fs);

    writeFileAsync(fileName, workbook, { compression: true }, () => {
      res(fileName);
    });
  });
}
