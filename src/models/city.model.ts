import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { cities } from "../db/schema";
import { t } from "elysia";
import { paginationModel } from "./common.model";

export const cityInsertModel = createInsertSchema(cities);

export const citySelectModel = createSelectSchema(cities);

export const addCityModel = t.Omit(cityInsertModel, ["id"]);

export const updateCityModel = t.Composite([
  t.Required(t.Pick(cityInsertModel, ["id"])),
  addCityModel,
]);

export const filterCitiesModel = t.Composite([
  paginationModel,
  t.Object({
    name: t.Optional(t.String()),
  }),
]);
