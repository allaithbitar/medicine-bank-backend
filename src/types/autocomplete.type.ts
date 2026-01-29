import { Static } from "elysia";
import {
  areasAutocompleteModel,
  autocompleteModel,
  employeesAutocompleteModel,
  medicinesAutocompleteModel,
} from "../models/autocomplete.model";

export type TAutocompleteDto<T> = Static<typeof autocompleteModel> & {
  columns?: Record<keyof T, boolean>;
};

export type TAreasAutocompleteDto = Static<typeof areasAutocompleteModel>;

export type TEmployeesAutocompleteDto = Static<
  typeof employeesAutocompleteModel
>;

export type TMedicinesAutocompleteDto = Static<
  typeof medicinesAutocompleteModel
>;
