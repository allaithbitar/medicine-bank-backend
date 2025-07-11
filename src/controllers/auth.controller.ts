import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import {} from "../models/disclosure.model";
import { EmployeeService } from "../services/employee.service";
import { loginEmployeeModel } from "../models/employee.model";
import { tokensModel } from "../models/auth.model";

export const AuthController = new Elysia({
  name: "Auth.Controller",
  tags: ["Auth"],
}).group("/auth", (app) =>
  app

    .resolve(() => ({
      employeeService: DiContainer.get(EmployeeService),
    }))

    .post(
      "/login",
      async ({ employeeService, body }) => {
        return await employeeService.loginEmployee(body);
      },
      {
        body: loginEmployeeModel,
      },
    )
    .post(
      "/refresh",
      ({ employeeService, body }) =>
        employeeService.refreshEmployeeToken({
          refreshToken: body.refreshToken,
        }),
      {
        body: tokensModel.body,
        headers: tokensModel.headers,
      },
    ),
);
