import { ERROR_CODES } from "./errors";

export const ERROR_MESSAGES = {
  [ERROR_CODES.USER_NOT_FOUND]: {
    en: "User doesn't exist",
    ar: "المستخدم غير موجود",
    code: "02",
  },
  [ERROR_CODES.WRONG_PASSWORD]: {
    en: "Entered password is incorrect",
    ar: "كلمة المرور المدخلة غير صحيحة",
    code: "03",
  },
  [ERROR_CODES.SESSION_EXPIRED]: {
    en: "Session Expired",
    ar: "انتهت صلاحية الجلسة",
    code: "04",
  },
  [ERROR_CODES.INVALID_TOKEN]: {
    en: "Auth token is invalid",
    ar: "الجلسة غير صالحة",
    code: "05",
  },
  [ERROR_CODES.NO_TOKEN]: {
    en: "Authorization is required",
    ar: "يجب تسجيل الدخول للقيام بهذه العملية",
    code: "06",
  },
  [ERROR_CODES.FORBIDDEN_ACTION]: {
    en: "Action has been blocked",
    ar: "تم حظر القيام بهذا العمل",
    code: "07",
  },
  [ERROR_CODES.ENTITY_NOT_FOUND]: {
    en: "Entity not found",
    ar: "لم يتم العثور على العنصر",
    code: "08",
  },
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
    en: "insufficient permissions",
    ar: "لا تملك الصلاحية للقيام بهذا العمل",
    code: "014",
  },
} as const;
