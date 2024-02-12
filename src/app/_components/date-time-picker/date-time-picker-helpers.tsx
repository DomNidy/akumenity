import { format } from "date-fns";

// utility function which gets the time in HH:MM format from a date
export function getHHMMStringFromDate(date: Date) {
  console.log(date, "date");
  const formatted = format(date, "HH:mm");
  console.log("🚀 ~ getTimeFromDate ~ const:", formatted);

  return formatted;
}
