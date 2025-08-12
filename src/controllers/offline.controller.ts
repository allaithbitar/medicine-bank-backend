import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { PatientService } from "../services/patient.service";
import { EmployeeService } from "../services/employee.service";
import { DisclosureService } from "../services/disclosure.service";
import { CityService } from "../services/city.service";
import { AreaService } from "../services/area.service";
import { RatingService } from "../services/rating.service";

export const OfflineController = new Elysia({
  name: "Offline.Controller",
  tags: ["Offline"],
}).group("/offline", (app) =>
  app
    .resolve(() => ({
      patientService: DiContainer.get(PatientService),
      employeeService: DiContainer.get(EmployeeService),
      disclosureService: DiContainer.get(DisclosureService),
      cityService: DiContainer.get(CityService),
      areaService: DiContainer.get(AreaService),
      ratingsService: DiContainer.get(RatingService),
    }))
    .get(
      "sync",
      async ({
        patientService,
        areaService,
        cityService,
        disclosureService,
        employeeService,
        ratingsService,
      }) => {
        const patients = await patientService.searchPatients({
          pageNumber: 0,
          pageSize: Number.MAX_SAFE_INTEGER,
        });

        const employees = await employeeService.searchEmployees({
          pageNumber: 0,
          pageSize: Number.MAX_SAFE_INTEGER,
        });

        const disclosures = await disclosureService.searchDisclosures({
          pageNumber: 0,
          pageSize: Number.MAX_SAFE_INTEGER,
        });

        const disclosuresRatings =
          await disclosureService.getDisclosuresRatings();

        const visits = await disclosureService.getDisclosuresVisits();

        const cities = await cityService.getCities({
          pageSize: Number.MAX_SAFE_INTEGER,
        });

        const areas = await areaService.getAreas({
          pageSize: Number.MAX_SAFE_INTEGER,
        });

        const ratings = await ratingsService.getRatings({});

        return {
          beneficiaries: patients.items,
          employees: employees.items,
          disclosures: disclosures.items,
          disclosuresRatings,
          visits,
          cities: cities.items,
          areas: areas.items,
          ratings: ratings,
        };
      },
    ),
);
