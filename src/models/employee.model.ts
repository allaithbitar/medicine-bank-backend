import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { employees } from "../db/schema";

export const employeeSelectModel = createSelectSchema(employees);

export const employeeInsertModel = createInsertSchema(employees);

export const addEmployeeModel = t.Omit(employeeInsertModel, [
  "createdAt",
  "updatedAt",
  "id",
]);

export const updateEmployeeModel = t.Composite([
  t.Pick(employeeSelectModel, ["id"]),
  addEmployeeModel,
]);

export const loginEmployeeModel = t.Pick(employeeInsertModel, [
  "phone",
  "password",
]);
