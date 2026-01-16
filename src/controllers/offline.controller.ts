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
  priorityDegrees,
  ratings,
} from "../db/schema";
import { desc } from "drizzle-orm";

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
        const _patients = await db
          .select()
          .from(patients)
          .orderBy(desc(patients.createdAt))
          .limit(100)
          .execute();
        const _disclosures = await db
          .select()
          .from(disclosures)
          .orderBy(desc(disclosures.createdAt))
          .limit(100)
          .execute();
        const _auditLogs = await db
          .select()
          .from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(100)
          .execute();

        const _priorityDegrees = await db
          .select()
          .from(priorityDegrees)
          .execute();

        const _ratings = await db.select().from(ratings).execute();

        const _cities = await db.select().from(cities).execute();

        const _areas = await db.select().from(areas).execute();

        const _disclosureNotes = await db
          .select()
          .from(disclosureNotes)
          .orderBy(desc(disclosureNotes.createdAt))
          .limit(100);

        const _disclosureDetails = await db
          .select()
          .from(disclosureDetails)
          .orderBy(desc(disclosureDetails.createdAt))
          .limit(100);

        const _areasToEmployees = await db.select().from(areasToEmployees);

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
        };
      },
    ),
);
