export const PG_ERROR_CODES = {
  UNIQUE_CONSTRAINT: "23505",
};

export const Unhandled_Db_Error = {
  en: "Unhandled Db Error",
  ar: "خطأ غير متوقع في قاعدة البيانات",
  code: "10",
};

export const DB_CONSTRAINT_ERRORS = {
  employees_phone_unique: {
    en: "Phone number  is already used by another employee",
    ar: "رقم الهاتف موجود بالفعل لدى موظف اخر",
    code: "11",
  },
  patients_national_number_unique: {
    en: "National number is already used by another patient",
    ar: "الرقم الوطني موجود بالفعل لدى مستفيد اخر",
    code: "12",
  },
  patients_phone_numbers_phone_unique: {
    en: "Phone number {phone} is already used by another patient",
    ar: "رقم الهاتف {phone} موجود بالفعل لدى مستفيد اخر",
    code: "13",
    var: "phone",
  },
  priority_degrees_name_unique: {
    en: "Priority degree name {name} already exists",
    ar: "اسم درجة الأهمية {name} موجود بالفعل",
    code: "14",
    var: "name",
  },
};
