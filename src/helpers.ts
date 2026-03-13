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

export function generateRandomNumberStr(length = 12) {
  const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  let result = "";
  for (let i = 0; i < length; i++) {
    result += nums[Math.floor(Math.random() * nums.length)];
  }
  return result;
}
