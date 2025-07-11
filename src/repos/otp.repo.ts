import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TDbContext } from "../db/drizzle";
import { otp } from "../db/schema";
import { eq } from "drizzle-orm";
import { TUserEntity } from "../types/user.types";

@injectable()
class OtpRepo {
  constructor(@inject("db") private db: TDbContext) {}
  async create(userId: TUserEntity["id"], otpCode: number) {
    return await this.db.insert(otp).values({ otp: otpCode, userId });
  }
  async getByUserId(userId: TUserEntity["id"]) {
    return await this.db.query.otp.findFirst({
      where: eq(otp.userId, userId),
    });
  }
  async deleteByUserId(userId: TUserEntity["id"]) {
    return await this.db.delete(otp).where(eq(otp.userId, userId));
  }
}

export default OtpRepo;
