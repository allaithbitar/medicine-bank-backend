import { Container } from "inversify";
import DbInstance from "../db/drizzle";
import { JwtService } from "../services/jwt.service";
// import { EmployeeRepo } from "../repos/employee.repo";
import { EmployeeService } from "../services/employee.service";
import { EmployeeRepo } from "../repos/employee.repo";
import { PatientRepo } from "../repos/patient.repo";
import { PatientService } from "../services/patient.service";
import { DisclosureRepo } from "../repos/disclosure.repo";
import { DisclosureService } from "../services/disclosure.service";
import { AreaRepo } from "../repos/area.repo";
import { AreaService } from "../services/area.service";
import { CityRepo } from "../repos/city.repo";
import { CityService } from "../services/city.service";
import { PriorityDegreeRepo } from "../repos/priority-degree.repo";
import { PriorityDegreeService } from "../services/priority-degree.service";
import { RatingRepo } from "../repos/rating.repo";
import { RatingService } from "../services/rating.service";

const DiContainer = new Container();

DiContainer.bind("db").toConstantValue(DbInstance);

DiContainer.bind<JwtService>(JwtService).toSelf().inRequestScope();
// DiContainer.bind<EmployeeRepo>(EmployeeRepo).toSelf().inRequestScope();
DiContainer.bind<EmployeeRepo>(EmployeeRepo).toSelf().inRequestScope();
DiContainer.bind<EmployeeService>(EmployeeService).toSelf().inRequestScope();
DiContainer.bind<PatientRepo>(PatientRepo).toSelf().inRequestScope();
DiContainer.bind<PatientService>(PatientService).toSelf().inRequestScope();
DiContainer.bind<DisclosureRepo>(DisclosureRepo).toSelf().inRequestScope();
DiContainer.bind<DisclosureService>(DisclosureService)
  .toSelf()
  .inRequestScope();

DiContainer.bind<AreaRepo>(AreaRepo).toSelf().inRequestScope();
DiContainer.bind<AreaService>(AreaService).toSelf().inRequestScope();
DiContainer.bind<CityRepo>(CityRepo).toSelf().inRequestScope();
DiContainer.bind<CityService>(CityService).toSelf().inRequestScope();
DiContainer.bind<PriorityDegreeRepo>(PriorityDegreeRepo)
  .toSelf()
  .inRequestScope();
DiContainer.bind<PriorityDegreeService>(PriorityDegreeService)
  .toSelf()
  .inRequestScope();
DiContainer.bind<RatingRepo>(RatingRepo).toSelf().inRequestScope();
DiContainer.bind<RatingService>(RatingService).toSelf().inRequestScope();

export default DiContainer;
