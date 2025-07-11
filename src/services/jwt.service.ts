import "reflect-metadata";
import { injectable } from "inversify";
import jwt, { SignOptions } from "jsonwebtoken";

@injectable()
export class JwtService {
  private privateKey = Bun.env.JWT_SECRET!;

  sign(data: object, options?: SignOptions): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign(
        data,
        this.privateKey,
        { expiresIn: "1min", ...options },
        function (err, token) {
          if (err) rej(err);
          res(token as string);
        },
      );
    });
  }
  async verify<T = any>(
    token: string,
  ): Promise<{ data: T; error: null } | { data: null; error: any }> {
    try {
      const result = await new Promise((res, rej) => {
        jwt.verify(token, this.privateKey, function (err, decoded) {
          if (err) rej(err);
          res(decoded as T);
        });
      });
      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
