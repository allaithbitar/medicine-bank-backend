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
  integer,
  index,
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
  "suspended",
  "archived",
]);

export const disclosure_type_enum = pgEnum("disclosure_type_enum", [
  "new",
  "return",
  "help",
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

export const house_ownership_status = pgEnum("house_ownership_status_enum ", [
  "owned",
  "rent",
  "loan",
  "mortage",
]);

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

export const notification_type_enum = pgEnum("notification_type_enum", [
  "consultation_requested",
  "consultation_completed",
]);

export const system_broadcast_type_enum = pgEnum("system_broadcast_type_enum", [
  "meeting",
  "custom",
]);

export const broadcast_audience_enum = pgEnum("broadcast_audience_enum", [
  "all",
  "scouts",
  "supervisors",
]);

export const audit_table_enum = pgEnum("audit_table_enum", [
  "disclosures",
  "disclosure_notes",
  "disclosure_consultations",
  "disclosure_details",
]);

export const audit_action_type_enum = pgEnum("audit_action_type_enum", [
  "INSERT",
  "UPDATE",
  "DELETE",
]);

export const consultation_status_enum = pgEnum("consultation_status_enum", [
  "pending",
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
  birthDate: date("birth_date", { mode: "string" }),
  gender: gender_enum("gender").default("male"),
  job: text("job"),
  address: text("address"),
  about: text("about"),
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
  nationalNumber: text("national_number"),
  kinshep: kinshep_enum("kinshep"),
  jobOrSchool: text("job_or_school"),
  note: text("note"),
  kidsCount: integer("kids_count"),
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

export const patientsPhoneNumbers = pgTable(
  "patients_phone_numbers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    phone: text("phone").notNull(),
  },
  (table) => [index("phone_patient_id_idx").on(table.patientId)],
);

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
  type: disclosure_type_enum("type").notNull().default("new"),
  priorityId: uuid("priority_id")
    .notNull()
    .references(() => priorityDegrees.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  scoutId: uuid("scout_id").references(() => employees.id),
  initialNote: text("initial_note"),
  //
  isReceived: boolean("is_received").notNull().default(false),
  archiveNumber: integer("archive_number"),
  //
  visitResult: visit_result_enum("visit_result"),
  visitReason: text("visit_reason"),
  visitNote: text("visit_note"),
  //
  ratingId: uuid("rating_id").references(() => ratings.id),
  isCustomRating: boolean("is_custom_rating").notNull().default(false),
  customRating: text("custom_rating"),
  ratingNote: text("rating_note"),
  //
  appointmentDate: date("appointment_date", { mode: "string" }),
  isAppointmentCompleted: boolean("is_appointment_completed")
    .notNull()
    .default(false),
  //
  ...createdAtColumn,
  ...updatedAtColumn,
  ...createdByColumn,
  ...updatedByColumn,
});

export const disclosureNotes = pgTable("disclosure_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteAudio: text("note_audio"),
  noteText: text("note_text"),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),
  ...createdAtColumn,
  ...createdByColumn,
  ...updatedAtColumn,
});

export const disclosureDetails = pgTable("disclosure_details", {
  disclosureId: uuid("disclosure_id")
    .references(() => disclosures.id)
    .primaryKey(),
  diseasesOrSurgeries: text("diseases_or_surgeries"),
  jobOrSchool: text("job_or_school"),
  electricity: text("electricity"),
  expenses: text("expenses"),
  houseOwnership: house_ownership_status("house_ownership"),
  houseOwnershipNote: text("house_ownership_note"),
  houseCondition: house_hold_asset_condition_enum("house_condition"),
  houseConditionNote: text("house_condition_note"),
  pros: text("pros"),
  cons: text("cons"),
  other: text("other"),
  ...createdAtColumn,
  ...createdByColumn,
  ...updatedAtColumn,
  ...updatedByColumn,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: notification_type_enum("type").notNull(),
  from: uuid("from")
    .notNull()
    .references(() => employees.id),
  to: uuid("to")
    .notNull()
    .references(() => employees.id),
  text: text("text"),
  recordId: uuid("record_id"),
  readAt: timestamp("read_at", {
    mode: "string",
    withTimezone: true,
  }),
});

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

export const disclosureConsultations = pgTable("disclosure_consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  disclosureId: uuid("disclosure_id")
    .notNull()
    .references(() => disclosures.id),

  consultationStatus: consultation_status_enum("consultation_status")
    .notNull()
    .default("pending"),
  consultedBy: uuid("consulted_by").references(() => employees.id),
  consultationNote: text("consultation_note"),
  consultationAudio: text("consultation_audio"),
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

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  table: audit_table_enum("table").notNull(),
  column: text("column"),
  action: audit_action_type_enum("action_type"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  recordId: uuid("record_id"),
  ...createdAtColumn,
  ...createdByColumn,
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
  rating: one(ratings, {
    fields: [disclosures.ratingId],
    references: [ratings.id],
  }),
  details: one(disclosureDetails, {
    fields: [disclosures.id],
    references: [disclosureDetails.disclosureId],
  }),
  notes: many(disclosureNotes),
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

export const patientPhoneNumbersRelations = relations(
  patientsPhoneNumbers,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientsPhoneNumbers.patientId],
      references: [patients.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  createdBy: one(employees, {
    fields: [auditLogs.createdBy],
    references: [employees.id],
  }),
}));

export const disclosureNoteRelations = relations(
  disclosureNotes,
  ({ one }) => ({
    createdBy: one(employees, {
      fields: [disclosureNotes.createdBy],
      references: [employees.id],
    }),
    disclosure: one(disclosures, {
      fields: [disclosureNotes.disclosureId],
      references: [disclosures.id],
    }),
  }),
);

export const disclosureDetailsRelations = relations(
  disclosureDetails,
  ({ one }) => ({
    createdBy: one(employees, {
      fields: [disclosureDetails.createdBy],
      references: [employees.id],
      relationName: "createdBy",
    }),
    updatedBy: one(employees, {
      fields: [disclosureDetails.updatedBy],
      references: [employees.id],
      relationName: "updatedBy",
    }),
    disclosure: one(disclosures, {
      fields: [disclosureDetails.disclosureId],
      references: [disclosures.id],
    }),
  }),
);

export const disclosureConsultationRelations = relations(
  disclosureConsultations,
  ({ one }) => ({
    disclosure: one(disclosures, {
      fields: [disclosureConsultations.disclosureId],
      references: [disclosures.id],
    }),

    consultedBy: one(employees, {
      fields: [disclosureConsultations.consultedBy],
      references: [employees.id],
      relationName: "consultedBy",
    }),
    createdBy: one(employees, {
      fields: [disclosureConsultations.createdBy],
      references: [employees.id],
      relationName: "createdBy",
    }),
    updatedBy: one(employees, {
      fields: [disclosureConsultations.updatedBy],
      references: [employees.id],
      relationName: "updatedBy",
    }),
  }),
);

export const notificationRelations = relations(notifications, ({ one }) => ({
  fromEmployee: one(employees, {
    fields: [notifications.from],
    references: [employees.id],
    relationName: "fromEmployee",
  }),
  toEmployee: one(employees, {
    fields: [notifications.to],
    references: [employees.id],
    relationName: "toEmployee",
  }),
}));
