import { t } from "elysia";
import { paginationModel } from "./common.model";

export const autocompleteModel = t.Composite([
  paginationModel,
  t.Partial(
    t.Object({
      query: t.String(),
      columns: t.Any(),
    }),
  ),
]);
