import { InferSelectModel } from "drizzle-orm";
import { auditLogs } from "../db/schema";

export type TAuditLog = InferSelectModel<typeof auditLogs>;
