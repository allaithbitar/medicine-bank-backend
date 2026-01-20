import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { PatientService } from "../services/patient.service";
import { EmployeeService } from "../services/employee.service";
import { DisclosureService } from "../services/disclosure.service";
import { CityService } from "../services/city.service";
import { AreaService } from "../services/area.service";
import { RatingService } from "../services/rating.service";
import { PatientRepo } from "../repos/patient.repo";
import { EmployeeRepo } from "../repos/employee.repo";
import { TDbContext } from "../db/drizzle";
import {
  areas,
  areasToEmployees,
  auditLogs,
  cities,
  disclosureDetails,
  disclosureNotes,
  disclosures,
  employees,
  patients,
  patientsPhoneNumbers,
  priorityDegrees,
  ratings,
} from "../db/schema";
import { and, desc, eq, inArray, or } from "drizzle-orm";

export const OfflineController = new Elysia({
  name: "Offline.Controller",
  tags: ["Offline"],
}).group("/offline", (app) =>
  app
    .resolve(() => ({
      patientRepo: DiContainer.get(PatientRepo),
      employeeRepo: DiContainer.get(EmployeeRepo),
      db: DiContainer.get("db") as TDbContext,
      // disclosureService: DiContainer.get(DisclosureService),
      // cityService: DiContainer.get(CityService),
      // areaService: DiContainer.get(AreaService),
      // ratingsService: DiContainer.get(RatingService),
    }))
    .get(
      "sync",
      async ({
        patientRepo,
        employeeRepo,
        db,
        // areaService,
        // cityService,
        // disclosureService,
        // employeeService,
        // ratingsService,
      }) => {
        const _employees = await db.select().from(employees);

        const _priorityDegrees = await db
          .select()
          .from(priorityDegrees)
          .execute();

        const _ratings = await db.select().from(ratings).execute();

        const _cities = await db.select().from(cities).execute();

        const _areas = await db.select().from(areas).execute();

        const _areasToEmployees = await db.select().from(areasToEmployees);

        const _disclosures = await db
          .select()
          .from(disclosures)
          .orderBy(desc(disclosures.createdAt))
          .limit(100)
          .execute();

        const _disclosureIds = _disclosures.map((d) => d.id);

        const _patientIds = _disclosures.map((d) => d.patientId);

        const _patients = await db
          .select()
          .from(patients)
          .orderBy(desc(patients.createdAt))
          .where(inArray(patients.id, _patientIds))
          .execute();

        const _patientsPhoneNumbers = await db
          .select()
          .from(patientsPhoneNumbers)
          .where(inArray(patientsPhoneNumbers.patientId, _patientIds))
          .execute();

        const _disclosureNotes = await db
          .select()
          .from(disclosureNotes)
          .orderBy(desc(disclosureNotes.createdAt))
          .where(inArray(disclosureNotes.disclosureId, _disclosureIds))
          .execute();

        const _disclosureNoteIds = _disclosureNotes.map((dn) => dn.id);

        const _disclosureDetails = await db
          .select()
          .from(disclosureDetails)
          .orderBy(desc(disclosureDetails.createdAt))
          .where(inArray(disclosureDetails.disclosureId, _disclosureIds))
          .execute();

        const _auditLogs = await db
          .select()
          .from(auditLogs)
          .where(
            or(
              and(
                eq(auditLogs.table, "disclosure_notes"),
                inArray(auditLogs.recordId, _disclosureNoteIds),
              ),
              and(
                eq(auditLogs.table, "disclosure_details"),
                inArray(auditLogs.recordId, _disclosureIds),
              ),
              and(
                eq(auditLogs.table, "disclosures"),
                inArray(auditLogs.recordId, _disclosureIds),
              ),
            ),
          )
          .orderBy(desc(auditLogs.createdAt))
          .execute();

        return {
          employees: _employees,
          areasToEmployees: _areasToEmployees,
          patients: _patients,
          disclosures: _disclosures,
          auditLogs: _auditLogs,
          priorityDegrees: _priorityDegrees,
          ratings: _ratings,
          cities: _cities,
          areas: _areas,
          disclosureNotes: _disclosureNotes,
          disclosureDetails: _disclosureDetails,
          patientsPhoneNumbers: _patientsPhoneNumbers,
        };
      },
    ),
);
