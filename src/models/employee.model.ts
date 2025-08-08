import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { employees } from "../db/schema";
import { paginationModel } from "./common.model";

export const employeeSelectModel = createSelectSchema(employees);

export const employeeInsertModel = createInsertSchema(employees);

export const addEmployeeModel = t.Omit(employeeInsertModel, [
  "createdAt",
  "updatedAt",
  "id",
]);

export const updateEmployeeModel = t.Composite([
  t.Pick(employeeSelectModel, ["id"]),
  t.Omit(addEmployeeModel, ["password"]),
  t.Partial(t.Pick(addEmployeeModel, ["password"])),
]);

export const loginEmployeeModel = t.Pick(employeeInsertModel, [
  "phone",
  "password",
]);

export const filterEmployeesModel = t.Partial(
  t.Composite([
    paginationModel,
    t.Omit(employeeSelectModel, [
      "password",
      "id",
      "name",
      "phone",
      "role",
      "createdAt",
      "updatedAt",
    ]),
    t.Object({
      query: t.String(),
      role: t.Optional(
        t.Array(employeeInsertModel.properties.role, { default: [] }),
      ),
    }),
  ]),
);
