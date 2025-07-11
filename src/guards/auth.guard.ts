import Elysia from "elysia";
import { ERROR_CODES, UnauthorizedError } from "../constants/errors";
import DiContainer from "../di/di-container";
import { JwtService } from "../services/jwt.service";

import { EmployeeRepo } from "../repos/employee.repo";
import { emplyee_role_enum } from "../db/schema";
import { tokensModel } from "../models/auth.model";

// type TAuthGuardParams = {
//   role?: Partial<typeof user_role_enum.enumValues>;
// };
//
export const AuthGuard =
  /* ({ role }: TAuthGuardParams = {}) => */
  new Elysia({ name: "Auth.Guard" })
    .guard({
      headers: tokensModel.headers,
    })
    .resolve(async ({ headers }) => {
      if (!headers.authorization) {
        throw new UnauthorizedError(ERROR_CODES.NO_TOKEN);
      }
      const jwtService = DiContainer.get(JwtService);

      const token = headers.authorization.split("Bearer ")?.[1] ?? "";

      if (!token) throw new UnauthorizedError(ERROR_CODES.INVALID_TOKEN);

      const { data, error } = await jwtService.verify(token);

      if (error) {
        throw new UnauthorizedError(ERROR_CODES.SESSION_EXPIRED);
      }

      const userId = data.userId as string;

      const employeeRepo = DiContainer.get(EmployeeRepo);

      const user = await employeeRepo.findById(userId);

      if (!user) throw new UnauthorizedError(ERROR_CODES.USER_NOT_FOUND);

      // if (role && !role.includes(user.role)) {
      //   throw new UnauthorizedError(ERROR_CODES.FORBIDDEN_ACTION);
      // }

      return { user };
    })
    .as("scoped")
    .macro({
      roles(roles: (typeof emplyee_role_enum.enumValues)[number][]) {
        return {
          beforeHandle(ctx) {
            if (
              !ctx.user ||
              (!roles.includes(ctx.user?.role ?? "") &&
                ctx.user?.role !== "manager")
            )
              throw new UnauthorizedError(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
          },
        };
      },
    });
