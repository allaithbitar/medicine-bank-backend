import { Elysia } from "elysia";
import {
  addEmployeeModel,
  updateEmployeeModel,
} from "../models/employee.model";
import DiContainer from "../di/di-container";
import { TDbContext } from "../db/drizzle";
import { EmployeeService } from "../services/employee.service";

export const EmployeesController = new Elysia({
  name: "Employees.Controller",
  tags: ["Employees"],
}).group("/employees", (app) =>
  app

    .resolve(() => ({ employeeService: DiContainer.get(EmployeeService) }))
    .post(
      "",
      ({ body, employeeService }) => employeeService.addEmployee(body),
      {
        body: addEmployeeModel,
      },
    )
    .put(
      "",
      () => {
        const db = DiContainer.get("db") as TDbContext;
        return db.query.employees.findMany({
          with: {
            area: true,
          },
        });
      },
      {
        body: updateEmployeeModel,
      },
    ),
);
