import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { priorityDegrees } from "../db/schema";
import { t } from "elysia";

export const priorityDegreeInsertModel = createInsertSchema(priorityDegrees);

export const priorityDegreeSelectModel = createSelectSchema(priorityDegrees);

export const addPriorityDegreeModel = t.Omit(priorityDegreeInsertModel, ["id"]);

export const updatePriorityDegreeModel = t.Composite([
  t.Omit(priorityDegreeSelectModel, ["color"]),
  t.Pick(priorityDegreeInsertModel, ["color"]),
]);

export const filterPriorityDegreesModel = t.Partial(
  t.Pick(priorityDegreeInsertModel, ["name"]),
);
