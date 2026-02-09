export const formatDateTime = (date: string | Date, withTime = true) =>
  Intl.DateTimeFormat("ar-SY", {
    dateStyle: "full",
    ...(withTime && {
      timeStyle: "short",
    }),
  }).format(typeof date === "string" ? new Date(date) : date);

export function isNullOrUndefined<T>(
  obj: T | undefined | null,
): obj is null | undefined {
  return obj === null || typeof obj === "undefined";
}
