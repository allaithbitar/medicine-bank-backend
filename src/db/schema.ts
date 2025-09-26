import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  real,
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

export const gender_enum = pgEnum("gender_enum", ["male", "female"]);

// export const martial_status_enum = pgEnum("martial_status_enum", [
//   "single",
//   "married",
//   "divorced",
// ]);

export const kinshep_enum = pgEnum("kinshep_enum", [
  "partner",
  "child",
  "parent",
  "brother",
  "grandparent",
  "grandchild",
]);

export const house_hold_asset_condition_enum = pgEnum(
  "house_hold_asset_condition_enum ",
  ["very_good", "good", "medium", "bad", "very_bad", "not_working"],
);

export const visit_result_enum = pgEnum("visit_status_enum", [
  "not_completed",
  "cant_be_completed",
  "completed",
]);

export const medicine_form_enum = pgEnum("medicine_form_enum", [
  "pill",
  "syrup",
  "injection",
  "capsule",
  "ointment",
]);

// export const notification_type_enum = pgEnum("notification_type_enum", [
//   "disclosure_check",
//   "patient_check",
// ]);

export const system_broadcast_type_enum = pgEnum("system_broadcast_type_enum", [
  "meeting",
  "custom",
]);

export const broadcast_audience_enum = pgEnum("broadcast_audience_enum", [
  "all",
  "scouts",
  "supervisors",
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
  birthDate: date("birth_date", { mode: "string" }),
  gender: gender_enum("gender").default("male"),
  job: text("job"),
  address: text("address").notNull().default(""),
  about: text("about").notNull().default(""),
  areaId: uuid("area_id").references(() => areas.id, {
    onDelete: "set null",
  }),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  birthDate: date("birth_date", { mode: "string" }),
  gender: gender_enum("gender"),
  // maritalStatus: martial_status_enum("marital_status"),
  kinshep: kinshep_enum("kinshep"),
  jobOrSchool: text("job_or_school"),
  note: text("note"),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const medicines = pgTable("medicines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  form: medicine_form_enum("form").notNull(),
  doseVariants: real("dose_variants").array().notNull(),
  // dosePerIntake: real("dose_per_intake").notNull(), // e.g., 1 pill
  // intakeFrequency: text("intake_frequency"),
  // note: text("note"),
});

export const patientMedicines = pgTable("patient_medicines", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  medicineId: uuid("medicine_id")
    .notNull()
    .references(() => medicines.id, { onDelete: "cascade" }),
  dosePerIntake: real("dose_per_intake"),
  intakeFrequency: text("intake_frequency"),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

// export const houseHoldAssets = pgTable("house_hold_assets", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: text("name").notNull(),
//   condition: house_hold_asset_condition_enum("condition").default("medium"),
//   available: boolean("available").default(true),
// });

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
  // isFinished: boolean("is_finished").default(false),
  // finished_at: timestamp("finished_at", {
  //   mode: "string",
  //   withTimezone: true,
  // }),
  // finishedBy: uuid("finished_by").references(() => employees.id),
  // isCanceled: boolean("is_canceled").default(false),
  // canceledAt: timestamp("canceled_at", {
  //   mode: "string",
  //   withTimezone: true,
  // }),
  // canceledBy: uuid("canceled_by").references(() => employees.id),
  note: text("note"),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

// export const disclosureNotes = pgTable("disclosure_notes", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   note: text("note"),
//   disclosureId: uuid("disclosure_id")
//     .notNull()
//     .references(() => priorityDegrees.id),
//   ...createdAtColumn,
//   ...updatedAtColumn,
//   ...createdByColumn,
// });

// export const notifications = pgTable("notifications", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   type: notification_type_enum("type").notNull(),
//   from: uuid("from")
//     .notNull()
//     .references(() => employees.id),
//   to: uuid("to")
//     .notNull()
//     .references(() => employees.id),
//   text: text("text"),
//   recordId: uuid("record_id"),
// });

export const systemBroadcasts = pgTable("system_broadcasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: system_broadcast_type_enum("type").notNull(),
  title: text("title"),
  details: text("details"),
  audience: broadcast_audience_enum("audience").default("all").notNull(),
  ...createdAtColumn,
});

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  note: text("note"),
  date: timestamp("date", {
    mode: "string",
    withTimezone: true,
  }),
  ...createdAtColumn,
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

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),
  date: date("date", { mode: "string" }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
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
  medicines: many(patientMedicines),
  familyMembers: many(familyMembers),
  createdBy: one(employees, {
    fields: [patients.createdBy],
    references: [employees.id],
  }),
  updatedBy: one(employees, {
    fields: [patients.updatedBy],
    references: [employees.id],
  }),
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  patient: one(patients, {
    fields: [familyMembers.patientId],
    references: [patients.id],
  }),
  createdBy: one(employees, {
    fields: [familyMembers.createdBy],
    references: [employees.id],
  }),
  updatedBy: one(employees, {
    fields: [familyMembers.updatedBy],
    references: [employees.id],
  }),
}));

export const medicineRelations = relations(medicines, ({ many }) => ({
  patients: many(patientMedicines),
}));

export const patientMedicinesRelations = relations(
  patientMedicines,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientMedicines.patientId],
      references: [patients.id],
    }),
    medicine: one(medicines, {
      fields: [patientMedicines.medicineId],
      references: [medicines.id],
    }),
    createdBy: one(employees, {
      fields: [patientMedicines.createdBy],
      references: [employees.id],
    }),
    updatedBy: one(employees, {
      fields: [patientMedicines.updatedBy],
      references: [employees.id],
    }),
  }),
);

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
  appointments: many(appointments),
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

export const appointmentRelations = relations(appointments, ({ one }) => ({
  disclosure: one(disclosures, {
    fields: [appointments.disclosureId],
    references: [disclosures.id],
  }),
  createdBy: one(employees, {
    fields: [appointments.createdBy],
    references: [employees.id],
  }),
  updatedBy: one(employees, {
    fields: [appointments.updatedBy],
    references: [employees.id],
  }),
}));
