import { t } from "elysia";
import { paginationModel } from "./common.model";
import { filterEmployeesModel } from "./employee.model";
import { filterAreasModel } from "./area.model";

export const autocompleteModel = t.Composite([
  paginationModel,
  t.Partial(
    t.Object({
      query: t.String(),
      columns: t.Any(),
    }),
  ),
]);

export const areasAutocompleteModel = t.Composite([
  autocompleteModel,
  t.Partial(t.Pick(filterAreasModel, ["cityId"])),
]);

export const employeesAutocompleteModel = t.Composite([
  autocompleteModel,
  t.Pick(filterEmployeesModel, ["role"]),
]);

export const medicinesAutocompleteModel = t.Composite([autocompleteModel]);
