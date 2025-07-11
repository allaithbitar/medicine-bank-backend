import { t } from "elysia";

export const paginationModel = t.Object({
  pageSize: t.Optional(t.Integer({ default: 10 })),
  pageNumber: t.Optional(t.Integer({ default: 0 })),
});
