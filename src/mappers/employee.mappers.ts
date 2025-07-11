import {
  TEmployeeEntity,
  TEmployeeLoginResponseDto,
  TSafeEmployeeEntity,
} from "../types/employee.type";

const employeeMappers = {
  entityToSafeEntity: (entity: TEmployeeEntity): TSafeEmployeeEntity => {
    const newObj = { ...entity } as Partial<TEmployeeEntity>;
    delete newObj.password;
    return newObj as TSafeEmployeeEntity;
  },
  safeEntityToLoginResponseDto: (
    entity: TSafeEmployeeEntity,
    token: string,
    refreshToken: string,
  ): TEmployeeLoginResponseDto => {
    return { ...entity, token, refreshToken };
  },
};

export default employeeMappers;
