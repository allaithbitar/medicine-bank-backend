import { Static } from "elysia";
import { autocompleteModel } from "../models/autocomplete.model";

export type TAutocompleteDto<T> = Static<typeof autocompleteModel> & {
  columns?: Record<keyof T, boolean>;
};
