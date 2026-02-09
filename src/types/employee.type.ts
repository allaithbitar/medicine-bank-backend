import { InferSelectModel } from "drizzle-orm";
import { employees } from "../db/schema";
import { Static } from "elysia";
import {
  addEmployeeModel,
  filterEmployeesModel,
  getRecommendedScoutsForPatientModel,
  updateEmployeeModel,
} from "../models/employee.model";
import { TJwtAuthTokens } from "./common.types";

export type TRefreshTokenDto = {
  refreshToken: string;
};

export type TEmployeeEntity = InferSelectModel<typeof employees>;

export type TSafeEmployeeEntity = Omit<TEmployeeEntity, "password">;

export type TEmployeeLoginResponseDto = TSafeEmployeeEntity & TJwtAuthTokens;

export type TAddEmployeeDto = Static<typeof addEmployeeModel>;

export type TUpdateEmployeeDto = Static<typeof updateEmployeeModel>;

export type TLoginEmployeeDto = Pick<TEmployeeEntity, "phone" | "password">;

export type TFilterEmployeesDto = Static<typeof filterEmployeesModel>;

export type TGetRecommendedScoutsForPatientDto = Static<
  typeof getRecommendedScoutsForPatientModel
>;
