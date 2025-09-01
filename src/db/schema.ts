import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const createdAtColumn = {
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
};

const updatedAtColumn = {
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
};

export const emplyee_role_enum = pgEnum("emplyee_role_enum", [
  "manager",
  "supervisor",
  "scout",
]);

export const disclosure_status_enum = pgEnum("disclosure_status_enum", [
  "active",
  "canceled",
  "finished",
]);

export const visit_result_enum = pgEnum("visit_status_enum", [
  "not_completed",
  "cant_be_completed",
  "completed",
]);

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const areas = pgTable(
  "areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "set null" }),
  },
  (table) => [unique("table_name_city_id_unique").on(table.name, table.cityId)],
);

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  phone: text("phone").notNull().unique(),
  role: emplyee_role_enum("role").notNull(),
  // areaId: uuid("area_id").references(() => areas.id, { onDelete: "set null" }),
  ...createdAtColumn,
  ...updatedAtColumn,
});

export const areasToEmployees = pgTable(
  "areas_to_employees ",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").notNull(),
    areaId: uuid("area_id").notNull(),
  },
  (table) => [
    unique("employee_area_unique").on(table.employeeId, table.areaId),
  ],
);

const createdByColumn = {
  createdBy: uuid("created_by").references(() => employees.id),
};

const updatedByColumn = {
  updatedBy: uuid("updated_by").references(() => employees.id),
};

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nationalNumber: text("national_number"),
  areaId: uuid("area_id").references(() => areas.id, {
    onDelete: "set null",
  }),
  address: text("address").notNull().default(""),
  about: text("about").notNull().default(""),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const patientsPhoneNumbers = pgTable("patients_phone_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(),
});

export const priorityDegrees = pgTable("priority_degrees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  color: text("color"),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull(),
});
export const disclosures = pgTable("disclosures", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: disclosure_status_enum("status").notNull().default("active"),
  priorityId: uuid("priority_id")
    .notNull()
    .references(() => priorityDegrees.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  scoutId: uuid("scout_id").references(() => employees.id),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),
  result: visit_result_enum("result").notNull().default("not_completed"),
  reason: text("reason"),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const disclosuresToRatings = pgTable("disclosures_to_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),
  ratingId: uuid("rating_id").references(() => ratings.id),
  isCustom: boolean("is_custom").notNull().default(false),
  customRating: text("custom_rating"),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

// export const disclosuresToVisists = pgTable("disclosures_to_visits", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   disclosureId: uuid("disclosure_id").references(() => disclosures.id),
//   visitId: uuid("visit_id").references(() => visits.id),
// });

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  columnName: text("column_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  action: text("action").notNull(), // e.g., 'INSERT', 'UPDATE', 'DELETE'
  ...createdByColumn,
  ...createdAtColumn,
});

// RELATIONS //

export const employeeRelations = relations(employees, ({ many }) => ({
  areas: many(areasToEmployees),
  disclosures_created: many(disclosures, { relationName: "createdBy" }),
  disclosures_assigned: many(disclosures, { relationName: "scout" }),
}));

export const areaRelations = relations(areas, ({ many, one }) => ({
  areasToEmployees: many(areasToEmployees),
  city: one(cities, { fields: [areas.cityId], references: [cities.id] }),
  // patient: one(patients, { fields: [areas.id], references: [patients.areaId] }),
}));

export const areasToEmployeeRelations = relations(
  areasToEmployees,
  ({ one }) => ({
    area: one(areas, {
      fields: [areasToEmployees.areaId],
      references: [areas.id],
    }),
    employee: one(employees, {
      fields: [areasToEmployees.employeeId],
      references: [employees.id],
    }),
  }),
);

export const patientRelations = relations(patients, ({ one, many }) => ({
  disclosures: many(disclosures),
  area: one(areas, { fields: [patients.areaId], references: [areas.id] }),
  phones: many(patientsPhoneNumbers),
  createdBy: one(employees, {
    fields: [patients.createdBy],
    references: [employees.id],
  }),
  updatedBy: one(employees, {
    fields: [patients.updatedBy],
    references: [employees.id],
  }),
}));

export const disclosureRelations = relations(disclosures, ({ one, many }) => ({
  scout: one(employees, {
    fields: [disclosures.scoutId],
    references: [employees.id],
    relationName: "scout",
  }),
  patient: one(patients, {
    fields: [disclosures.patientId],
    references: [patients.id],
  }),
  priority: one(priorityDegrees, {
    fields: [disclosures.priorityId],
    references: [priorityDegrees.id],
  }),
  visits: many(visits),
  ratings: many(disclosuresToRatings),
  createdBy: one(employees, {
    fields: [disclosures.createdBy],
    references: [employees.id],
    relationName: "createdBy",
  }),
  updatedBy: one(employees, {
    fields: [disclosures.updatedBy],
    references: [employees.id],
    relationName: "updatedBy",
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  disclosure: one(disclosures, {
    fields: [visits.disclosureId],
    references: [disclosures.id],
  }),
  createdBy: one(employees, {
    fields: [visits.createdBy],
    references: [employees.id],
  }),
  updatedBy: one(employees, {
    fields: [visits.updatedBy],
    references: [employees.id],
  }),
}));

// export const disclosuresToVisistsRelations = relations(
//   disclosuresToVisists,
//   ({ one }) => ({
//     disclosure: one(disclosures, {
//       fields: [disclosuresToVisists.disclosureId],
//       references: [disclosures.id],
//     }),
//     visit: one(visits, {
//       fields: [disclosuresToVisists.visitId],
//       references: [visits.id],
//     }),
//   }),
// );

export const disclosuresToRatingsRelations = relations(
  disclosuresToRatings,
  ({ one }) => ({
    disclosure: one(disclosures, {
      fields: [disclosuresToRatings.disclosureId],
      references: [disclosures.id],
    }),
    rating: one(ratings, {
      fields: [disclosuresToRatings.ratingId],
      references: [ratings.id],
    }),
    createdBy: one(employees, {
      fields: [disclosuresToRatings.createdBy],
      references: [employees.id],
    }),
    updatedBy: one(employees, {
      fields: [disclosuresToRatings.updatedBy],
      references: [employees.id],
    }),
  }),
);

export const patientPhoneNumbersRelations = relations(
  patientsPhoneNumbers,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientsPhoneNumbers.patientId],
      references: [patients.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  createdBy: one(employees, {
    fields: [auditLog.createdBy],
    references: [employees.id],
  }),
}));
