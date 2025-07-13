// import { pgTable } from "drizzle-orm/pg-core"

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
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

export const areas = pgTable("areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cityId: uuid("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "set null" }),
});

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  phone: text("phone").notNull().unique(),
  role: emplyee_role_enum("role").notNull(),
  areaId: uuid("area_id").references(() => areas.id, { onDelete: "set null" }),
  ...createdAtColumn,
  ...updatedAtColumn,
});

const updatedBy = {
  updatedBy: uuid("updated_by").references(() => employees.id),
};

const createdBy = {
  createdBy: uuid("created_by").references(() => employees.id),
};

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nationalNumber: text("national_number").notNull().unique(),
  areaId: uuid("area_id").references(() => areas.id, {
    onDelete: "set null",
  }),
  address: text("address").notNull().default(""),
  about: text("about").notNull().default(""),
  ...createdAtColumn,
  ...updatedAtColumn,
});

export const patientsPhoneNumbers = pgTable("patients_phone_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  phone: text("phone").unique().notNull(),
});

export const priorityDegrees = pgTable("priority_degrees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  color: text("color"),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  description: text("description"),
  code: text("code"),
});

export const disclosures = pgTable("disclosures", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: disclosure_status_enum("status").notNull().default("active"),
  priortyId: uuid("priorty_id")
    .notNull()
    .references(() => priorityDegrees.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  employeeId: uuid("employee_id").references(() => employees.id),
  ...createdAtColumn,
  ...updatedAtColumn,
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id").references(() => disclosures.id),
  result: visit_result_enum("result").default("not_completed"),
  reason: text("reason"),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdBy,
  ...updatedBy,
});

export const disclosuresToRatings = pgTable("disclosures_to_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),
  ratingId: uuid("rating_id").references(() => ratings.id),
  isCustom: boolean("is_custom").notNull().default(false),
  customRating: text("custom_rating"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdBy,
  ...updatedBy,
});

export const disclosuresToVisists = pgTable("disclosures_to_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id").references(() => disclosures.id),
  visitId: uuid("visit_id").references(() => visits.id),
});

// RELATIONS //

export const employeeRelations = relations(employees, ({ one, many }) => ({
  disclosures: many(disclosures),
  area: one(areas, { fields: [employees.areaId], references: [areas.id] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  disclosures: many(disclosures),
  area: one(areas, { fields: [patients.areaId], references: [areas.id] }),
  phones: many(patientsPhoneNumbers),
}));

export const disclosureRelations = relations(disclosures, ({ one, many }) => ({
  employee: one(employees, {
    fields: [disclosures.employeeId],
    references: [employees.id],
  }),
  patient: one(patients, {
    fields: [disclosures.patientId],
    references: [patients.id],
  }),
  prioriy: one(priorityDegrees, {
    fields: [disclosures.priortyId],
    references: [priorityDegrees.id],
  }),
  visits: many(disclosuresToVisists),
  ratings: many(disclosuresToRatings),
}));

export const visitsRelations = relations(visits, ({ many }) => ({
  disclosure: many(disclosuresToVisists),
}));

export const disclosuresToVisistsRelations = relations(
  disclosuresToVisists,
  ({ one }) => ({
    disclosure: one(disclosures, {
      fields: [disclosuresToVisists.disclosureId],
      references: [disclosures.id],
    }),
    visit: one(visits, {
      fields: [disclosuresToVisists.visitId],
      references: [visits.id],
    }),
  }),
);

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
