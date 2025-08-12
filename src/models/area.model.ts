import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { areas } from "../db/schema";
import { t } from "elysia";
import { paginationModel } from "./common.model";

export const areaInsertModel = createInsertSchema(areas);

export const areaSelectModel = createSelectSchema(areas);

export const addAreaModel = t.Omit(areaInsertModel, ["id"]);

export const updateAreaModel = t.Composite([
  t.Required(t.Pick(areaInsertModel, ["id"])),
  addAreaModel,
]);

export const filterAreasModel = t.Composite([
  paginationModel,
  t.Object({
    name: t.Optional(t.String()),
    cityId: t.Optional(t.String({ format: "uuid" })),
  }),
]);
