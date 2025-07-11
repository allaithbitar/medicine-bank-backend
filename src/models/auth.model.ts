import { t } from "elysia";

export const tokensModel = {
  body: t.Object({
    refreshToken: t.String(),
  }),
  headers: t.Object({
    authorization: t.TemplateLiteral("Bearer ${string}", {
      default: "Bearer ",
    }),
  }),
};
