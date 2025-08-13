import { Elysia, t } from "elysia";
import {
  addEmployeeModel,
  filterEmployeesModel,
  updateEmployeeModel,
} from "../models/employee.model";
import DiContainer from "../di/di-container";
import { EmployeeService } from "../services/employee.service";

export const EmployeesController = new Elysia({
  name: "Employees.Controller",
  tags: ["Employees"],
}).group("/employees", (app) =>
  app

    .resolve(() => ({ employeeService: DiContainer.get(EmployeeService) }))
    .post(
      "/search",
      ({ body, employeeService }) => employeeService.searchEmployees(body),
      {
        body: filterEmployeesModel,
      },
    )
    .get(
      "/:id",
      ({ params, employeeService }) =>
        employeeService.getEmployeeById(params.id),
      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    )

    .post(
      "",
      ({ body, employeeService }) => employeeService.addEmployee(body),
      {
        body: addEmployeeModel,
      },
    )
    .put(
      "",
      ({ employeeService, body }) => employeeService.updateEmployee(body),

      {
        body: updateEmployeeModel,
      },
    ),
);
