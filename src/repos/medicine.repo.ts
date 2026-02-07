import { inject, injectable } from "inversify";
import { TDbContext } from "../db/drizzle";
import { medicines, patientMedicines } from "../db/schema";
import { and, count, eq, ilike, inArray } from "drizzle-orm";
import { TPaginatedResponse } from "../types/common.types";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../constants/constants";

import {
  TAddMedicineDto,
  TAddPatientMedicineDto,
  TFilterMedicinesDto,
  TFilterPatientMedicinesDto,
  TMedicine,
  TPatientMedicine,
  TUpdateMedicineDto,
  TUpdatePatientMedicineDto,
} from "../types/medicine.type";
import { ERROR_CODES, NotFoundError } from "../constants/errors";

@injectable()
export class MedicineRepo {
  constructor(@inject("db") private db: TDbContext) {}

  private getMedicinesFilters({ form, name }: TFilterMedicinesDto) {
    let nameFilter;
    let formFilter;

    if (name?.length) {
      nameFilter = ilike(medicines.name, `%${name}%`);
    }

    if (form?.length) {
      formFilter = eq(medicines.form, form);
    }

    return {
      nameFilter,
      formFilter,
    };
  }

  private async getMedicinesCount(dto: TFilterMedicinesDto) {
    const { formFilter, nameFilter } = this.getMedicinesFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(medicines)
      .where(and(formFilter, nameFilter));

    return totalCount;
  }

  async getMedicinesPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterMedicinesDto): Promise<TPaginatedResponse<TMedicine>> {
    const totalCount = await this.getMedicinesCount(rest);
    const { formFilter, nameFilter } = this.getMedicinesFilters(rest);

    const result = await this.db.query.medicines.findMany({
      where: and(formFilter, nameFilter),
      limit: pageSize,
      offset: pageSize * pageNumber,
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async getMedicineById(id: string): Promise<TMedicine> {
    const res = await this.db.query.medicines.findFirst({
      where: eq(medicines.id, id),
    });

    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
  }

  async createMedicine(dto: TAddMedicineDto, tx?: TDbContext) {
    return await (tx ?? this.db).insert(medicines).values(dto);
  }

  async updateMedicine(dto: TUpdateMedicineDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    return await (tx ?? this.db)
      .update(medicines)
      .set(rest)
      .where(eq(medicines.id, id));
  }
  // PATIENT MEDICINE //

  private async getPatientMedicinesFilters({
    patientId,
    form,
    name,
  }: TFilterPatientMedicinesDto) {
    const patientFilter = eq(patientMedicines.patientId, patientId);

    let medicineIds: string[] | undefined = undefined;

    if (name || form) {
      console.log({ name, form });

      let nameFilter;
      let formFilter;

      if (name) {
        nameFilter = ilike(medicines.name, `%${name}%`);
      }

      if (form) {
        formFilter = eq(medicines.form, form);
      }

      const _meds = await this.db
        .select({ id: medicines.id })
        .from(medicines)
        .where(and(formFilter, nameFilter));
      console.log({ name, form });

      medicineIds = _meds.map((m) => m.id);
    }

    let medicineFilters;

    if (medicineIds) {
      medicineFilters = inArray(patientMedicines.medicineId, medicineIds);
    }

    // let nameFilter;
    // let formFilter;
    //
    // if (name?.length) {
    //   nameFilter = eq(medicines.name, `%${name}%`);
    // }
    //
    // if (form?.length) {
    //   formFilter = eq(medicines.form, form);
    // }

    return {
      patientFilter,
      medicineFilters,
    };
  }

  private async getPatientMedicinesCount(dto: TFilterPatientMedicinesDto) {
    const { medicineFilters, patientFilter } =
      await this.getPatientMedicinesFilters(dto);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(patientMedicines)
      .where(and(medicineFilters, patientFilter));

    return totalCount;
  }

  async getPatientMedicinesPaginated({
    pageNumber = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
    ...rest
  }: TFilterPatientMedicinesDto): Promise<
    TPaginatedResponse<TPatientMedicine>
  > {
    const totalCount = await this.getPatientMedicinesCount(rest);
    const { medicineFilters, patientFilter } =
      await this.getPatientMedicinesFilters(rest);

    const result = await this.db.query.patientMedicines.findMany({
      where: and(medicineFilters, patientFilter),
      limit: pageSize,
      offset: pageSize * pageNumber,
      with: { medicine: true },
    });

    return { items: result, totalCount, pageNumber, pageSize };
  }

  async getPatientMedicineById(id: string): Promise<TPatientMedicine> {
    const res = await this.db.query.patientMedicines.findFirst({
      where: eq(patientMedicines.id, id),
      with: { medicine: true },
    });

    if (!res) {
      throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    }
    return res;
  }

  async createPatientMedicine(dto: TAddPatientMedicineDto, tx?: TDbContext) {
    const [result] = await (tx ?? this.db)
      .insert(patientMedicines)
      .values(dto)
      .returning();
    return result;
  }

  async updatePatientMedicine(dto: TUpdatePatientMedicineDto, tx?: TDbContext) {
    const { id, ...rest } = dto;
    return await (tx ?? this.db)
      .update(patientMedicines)
      .set(rest)
      .where(eq(patientMedicines.id, id));
  }
}
