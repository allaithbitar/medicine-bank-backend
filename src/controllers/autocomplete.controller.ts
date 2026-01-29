import Elysia from "elysia";
import {
  addSystemBroadcastModel,
  filterSystemBroadcastsModel,
  updateSystemBroadcastModel,
} from "../models/system-broadcast.model";
import DiContainer from "../di/di-container";
import { AutocompleteRepo } from "../repos/autocomplete.repo";
import {
  areasAutocompleteModel,
  autocompleteModel,
  employeesAutocompleteModel,
  medicinesAutocompleteModel,
} from "../models/autocomplete.model";

export const AutocompleteController = new Elysia({
  name: "Autocomplete.Controller",
  tags: ["Autocomplete"],
}).group("/autocomplete", (app) =>
  app
    // .use(AuthGuard)
    .resolve(() => ({
      autocompleteRepo: DiContainer.get(AutocompleteRepo),
    }))
    .post(
      "cities",
      ({ autocompleteRepo, body }) =>
        autocompleteRepo.getPaginatedCities(body as any),
      {
        body: autocompleteModel,
      },
    )
    .post(
      "areas",
      ({ autocompleteRepo, body }) =>
        autocompleteRepo.getPaginatedAreas(body as any),
      {
        body: areasAutocompleteModel,
      },
    )
    .post(
      "patients",
      ({ autocompleteRepo, body }) =>
        autocompleteRepo.getPaginatedPatients(body as any),
      {
        body: autocompleteModel,
      },
    )
    .post(
      "employees",
      ({ autocompleteRepo, body }) =>
        autocompleteRepo.getPaginatedEmployees(body as any),
      {
        body: employeesAutocompleteModel,
      },
    )
    .post(
      "medicines",
      ({ autocompleteRepo, body }) =>
        autocompleteRepo.getPaginatedMedicines(body as any),
      {
        body: medicinesAutocompleteModel,
      },
    ),
);
