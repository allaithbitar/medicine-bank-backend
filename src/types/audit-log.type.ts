import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { auditLogs } from "../db/schema";

export type TAuditLog = InferSelectModel<typeof auditLogs>;

export type TInsertAuditLog = InferInsertModel<typeof auditLogs>;
