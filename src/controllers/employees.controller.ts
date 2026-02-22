import { Elysia, t } from "elysia";
import {
  addEmployeeModel,
  filterEmployeesModel,
  getRecommendedScoutsForAreaModel,
  updateEmployeeModel,
} from "../models/employee.model";
import DiContainer from "../di/di-container";
import { EmployeeService } from "../services/employee.service";
import { AuthGuard } from "../guards/auth.guard";

export const EmployeesController = new Elysia({
  name: "Employees.Controller",
  tags: ["Employees"],
}).group("/employees", (app) =>
  app
    .use(AuthGuard)
    .resolve(() => ({ employeeService: DiContainer.get(EmployeeService) }))
    .post(
      "/search",
      ({ body, employeeService }) => employeeService.searchEmployees(body),
      {
        body: filterEmployeesModel,
        roles: ["manager", "supervisor"],
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
        roles: ["manager"],
      },
    )
    .put(
      "",
      ({ employeeService, body }) => employeeService.updateEmployee(body),

      {
        body: updateEmployeeModel,
        roles: ["manager"],
      },
    )
    .get(
      "area-scouts-recommendations",
      ({ employeeService, query }) =>
        employeeService.getRecommondedScoutsForArea(query.areaId),

      {
        query: getRecommendedScoutsForAreaModel,
      },
    ),
);
