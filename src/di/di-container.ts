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
import { SatisticsService } from "../services/satistics.service";
import { FamilyMemberRepo } from "../repos/family-member.repo";
import { FamilyMemberService } from "../services/family-member.service";
import { MedicineRepo } from "../repos/medicine.repo";
import { MedicineService } from "../services/medicine.service";

import { SystemBroadcastRepo } from "../repos/system-broadcast.repo";
import { SystemBroadcastService } from "../services/system-broadcast.service";
import { MeetingService } from "../services/meeting.service";
import { MeetingRepo } from "../repos/meeting.repo";
import { AuditLogRepo } from "../repos/audit-log.repo";
import { DisclosureConsultationRepo } from "../repos/disclosure-consultation.repo";
import { NotificationRepo } from "../repos/notification.repo";
import { NotificationService } from "../services/notification.service";
import { AutocompleteRepo } from "../repos/autocomplete.repo";
import { PaymentRepo } from "../repos/payment.repo";
import { PaymentService } from "../services/payment.service";

const DiContainer = new Container();

DiContainer.bind("db").toConstantValue(DbInstance);

DiContainer.bind<JwtService>(JwtService).toSelf().inSingletonScope();
DiContainer.bind<EmployeeRepo>(EmployeeRepo).toSelf().inSingletonScope();
DiContainer.bind<EmployeeService>(EmployeeService).toSelf().inSingletonScope();
DiContainer.bind<PatientRepo>(PatientRepo).toSelf().inSingletonScope();
DiContainer.bind<PatientService>(PatientService).toSelf().inSingletonScope();
DiContainer.bind<DisclosureRepo>(DisclosureRepo).toSelf().inSingletonScope();
DiContainer.bind<DisclosureService>(DisclosureService)
  .toSelf()
  .inSingletonScope();

DiContainer.bind<AreaRepo>(AreaRepo).toSelf().inSingletonScope();
DiContainer.bind<AreaService>(AreaService).toSelf().inSingletonScope();
DiContainer.bind<CityRepo>(CityRepo).toSelf().inSingletonScope();
DiContainer.bind<CityService>(CityService).toSelf().inSingletonScope();
DiContainer.bind<PriorityDegreeRepo>(PriorityDegreeRepo)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<PriorityDegreeService>(PriorityDegreeService)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<RatingRepo>(RatingRepo).toSelf().inSingletonScope();
DiContainer.bind<RatingService>(RatingService).toSelf().inSingletonScope();
DiContainer.bind<SatisticsService>(SatisticsService).toSelf().inSingletonScope();
DiContainer.bind<FamilyMemberRepo>(FamilyMemberRepo).toSelf().inSingletonScope();
DiContainer.bind<FamilyMemberService>(FamilyMemberService)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<MedicineRepo>(MedicineRepo).toSelf().inSingletonScope();
DiContainer.bind<MedicineService>(MedicineService).toSelf().inSingletonScope();

DiContainer.bind<SystemBroadcastRepo>(SystemBroadcastRepo)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<SystemBroadcastService>(SystemBroadcastService)
  .toSelf()
  .inSingletonScope();

DiContainer.bind<MeetingRepo>(MeetingRepo).toSelf().inSingletonScope();
DiContainer.bind<MeetingService>(MeetingService).toSelf().inSingletonScope();
DiContainer.bind<AuditLogRepo>(AuditLogRepo).toSelf().inSingletonScope();
DiContainer.bind<DisclosureConsultationRepo>(DisclosureConsultationRepo)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<NotificationRepo>(NotificationRepo).toSelf().inSingletonScope();
DiContainer.bind<NotificationService>(NotificationService)
  .toSelf()
  .inSingletonScope();
DiContainer.bind<AutocompleteRepo>(AutocompleteRepo).toSelf().inSingletonScope();
DiContainer.bind<PaymentRepo>(PaymentRepo).toSelf().inSingletonScope();
DiContainer.bind<PaymentService>(PaymentService).toSelf().inSingletonScope();

export default DiContainer;
