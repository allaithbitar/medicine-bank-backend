import { inject, injectable } from "inversify";
import "reflect-metadata";
import { EmployeeRepo } from "../repos/employee.repo";
import {
  TAddEmployeeDto,
  TFilterEmployeesDto,
  TLoginEmployeeDto,
  TRefreshTokenDto,
  TUpdateEmployeeDto,
} from "../types/employee.type";
import {
  ERROR_CODES,
  NotFoundError,
  UnauthorizedError,
} from "../constants/errors";
import { JwtService } from "./jwt.service";
import employeeMappers from "../mappers/employee.mappers";
@injectable()
export class EmployeeService {
  constructor(
    @inject(EmployeeRepo) private employeeRepo: EmployeeRepo,
    @inject(JwtService) private jwtService: JwtService,
  ) {}

  async addEmployee(dto: TAddEmployeeDto) {
    const passwordHash = await Bun.password.hash(dto.password);
    return this.employeeRepo.create({ ...dto, password: passwordHash });
  }

  async updateEmployee(dto: TUpdateEmployeeDto) {
    const employee = await this.employeeRepo.findById(dto.id);

    if (!employee) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
    }

    const { password: oldPassword } = employee;

    let newPassword = oldPassword;

    if (dto.password) {
      const newPasswordHashed = await Bun.password.hash(dto.password);
      newPassword = newPasswordHashed;
    }

    await this.employeeRepo.update({ ...dto, password: newPassword });
  }

  async loginEmployee(dto: TLoginEmployeeDto) {
    const employee = await this.employeeRepo.findByPhone(dto.phone);
    if (!employee) {
      throw new UnauthorizedError(ERROR_CODES.USER_NOT_FOUND);
    }
    const isValidPassword = await Bun.password.verify(
      dto.password,
      employee.password,
    );
    // const isValidPassword = user.password === dto.password;

    if (!isValidPassword) {
      throw new UnauthorizedError(ERROR_CODES.WRONG_PASSWORD);
    }
    const token = await this.jwtService.sign(
      {
        userId: employee.id,
      },
      { expiresIn: Bun.env.JWT_TOKEN_EXPIRE as any },
    );

    const refreshToken = await this.jwtService.sign(
      {
        userId: employee.id,
      },
      { expiresIn: Bun.env.JWT_REFRESH_TOKEN_EXPIRE as any },
    );

    return employeeMappers.safeEntityToLoginResponseDto(
      employeeMappers.entityToSafeEntity(employee),
      token,
      refreshToken,
    );
  }

  async refreshEmployeeToken(dto: TRefreshTokenDto) {
    const { refreshToken } = dto;
    const { data, error } = await this.jwtService.verify<{ userId: string }>(
      refreshToken,
    );
    if (error) {
      throw new UnauthorizedError(ERROR_CODES.INVALID_TOKEN);
    }
    const user = await this.employeeRepo.findById(data!.userId);

    if (!user) {
      throw new UnauthorizedError(ERROR_CODES.USER_NOT_FOUND);
    }

    const newToken = await this.jwtService.sign(
      { userId: user.id },
      { expiresIn: Bun.env.JWT_TOKEN_EXPIRE as any },
    );

    const newRefreshToken = await this.jwtService.sign(
      { userId: user.id },
      { expiresIn: Bun.env.JWT_REFRESH_TOKEN_EXPIRE as any },
    );

    return employeeMappers.safeEntityToLoginResponseDto(
      employeeMappers.entityToSafeEntity(user),
      newToken,
      newRefreshToken,
    );
  }

  async searchEmployees(dto: TFilterEmployeesDto) {
    return await this.employeeRepo.findManyWithIncludesPaginated(dto);
  }

  async getEmployeeById(id: string) {
    const result = await this.employeeRepo.findOneByIdWithIncludes(id);
    if (!result) throw new NotFoundError(ERROR_CODES.ENTITY_NOT_FOUND);
    return result;
  }
}
