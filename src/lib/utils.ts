import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type z } from "zod";
import {
  type TopicSessionSlice,
  CalendarGridDisplayMode,
  type CalendarGridContextType,
} from "~/app/_components/calendar-grid/calendar-grid-definitions";

import { type dbConstants } from "~/definitions/dbConstants";
import { type RouterOutputs } from "~/trpc/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLabelColor(
  colorCode: z.infer<
    typeof dbConstants.itemTypes.topic.itemSchema
  >["ColorCode"],
) {
  switch (colorCode) {
    case "blue":
      return "bg-blue-600";
    case "red":
      return "bg-red-600";
    case "green":
      return "bg-green-600";
    case "orange":
      return "bg-orange-600";
    case "pink":
      return "bg-pink-600";
    case "purple":
      return "bg-purple-600";
    case "yellow":
      return "bg-yellow-600";
    case "indigo":
      return "bg-indigo-600";
    default:
      return "bg-blue-600";
  }
}

// chunkArray is a local convenience function. It takes an array and returns a generator that yields every N items.
export function* chunkArray<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

// Function which returns the time since a current timestamp (in ms) and a previous timestamp (in ms) in a human readable format.
// Example format: (1 hour, 30 minutes, 35 seconds would be 1:30:35)
export function timeSince(current: number, previous: number) {
  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;

  const elapsed = current - previous;

  const hours = Math.floor(elapsed / msPerHour);
  const minutes = Math.floor((elapsed % msPerHour) / msPerMinute);
  const seconds = Math.floor(
    ((elapsed % msPerHour) % msPerMinute) / msPerSecond,
  );

  const hoursStr = hours < 10 ? `${hours}` : hours;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

// Function which formats a number of miliseconds into a human readable format.
// Example format: (1030 * 60 * 60 * 10 should format to 10 hours, 30 minutes)
export function formatTime(milliseconds: number): string {
  // Calculate hours, minutes, and seconds from milliseconds
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  // Construct the formatted string
  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    if (formattedTime.length > 0) {
      formattedTime += `, `;
    }
    formattedTime += `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  // If no hours or minutes, display '0 minutes'
  if (formattedTime.length === 0) {
    formattedTime = `0 minutes`;
  }

  return formattedTime;
}

// Utility function that returns the time at which the week (in which the date passed as an argument falls) starts and ends.
export function getWeekStartAndEndMS(date: Date) {
  // Start with a date object at 12:00:00 AM on the given date
  const start = new Date(date);
  const end = new Date(date);

  // Adjust the start date to the beginning of the week (Sunday)
  start.setDate(start.getUTCDate() - start.getUTCDay());

  // Adjust the end date to the end of the week (Saturday)
  end.setDate(end.getUTCDate() + (6 - end.getUTCDay()));

  // Set the start time to 12:00:00.000
  start.setUTCHours(0, 0, 0, 0);

  // Set the end time to 23:59:59.999
  end.setUTCHours(23, 59, 59, 999);

  return {
    startTimeMS: start.getTime(),
    endTimeMS: end.getTime(),
  };
}

// Utility function that returns a date from a day since unix epoch (January 1, 1970)
export function getDateFromDaySinceUnixEpoch(day: number) {
  return new Date(day * 24 * 60 * 60 * 1000);
}

// TODO: Make tests for this function
// Function which returns the week number (number of weeks that have occured since epoch) in which the date passed as an argument falls.
export function getWeeksSinceUnixEpoch(date: Date) {
  const { startTimeMS } = getWeekStartAndEndMS(date);

  return Math.floor(startTimeMS / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// Utility function which gets the start of the nth week (in local time) from the unix epoch (January 1, 1970)
export function getNthWeekBeginDate(n: number) {
  const targetYear = new Date(0).getUTCFullYear() + Math.floor(n / 52);
  const targetWeekInYear = n % 52;
  const targetDate = getDateFromDaySinceUnixEpoch(targetWeekInYear * 7);
  targetDate.setUTCFullYear(targetYear);
  return targetDate;
}

// Utility function which returns the number of months that have occured since unix epoch (January 1, 1970) for a given date
export function getMonthsSinceUnixEpoch(date: Date) {
  // We need to calculate this instead of just using a constant because the unix epoch might be a different month in the local timezone
  const unixEpoch = new Date(0);
  const monthOfUnixEpoch = unixEpoch.getFullYear() * 12 + unixEpoch.getMonth();
  const monthOfDate = date.getFullYear() * 12 + date.getMonth();
  return monthOfDate - monthOfUnixEpoch;
}

// Utility function which gets the start of the nth month (in local time) from the unix epoch (January 1, 1970)
export function getNthMonthBeginDate(n: number) {
  const targetYear = new Date(0).getUTCFullYear() + Math.floor(n / 12);
  const targetMonthInYear = n % 11;
  return new Date(targetYear, targetMonthInYear);
}

// Function which returns the days since unix epoch (January 1, 1970) for a given date
export function getDaysSinceUnixEpoch(date: Date) {
  // Becuase the local timezone might not be UTC, we should add an offset so we get the correct day
  const timezoneOffsetMS = date.getTimezoneOffset() * 60 * 1000;

  return Math.floor(
    (date.getTime() - timezoneOffsetMS) / (24 * 60 * 60 * 1000),
  );
}

// Function which creates TopicSessionSlice objects from a given TopicSession
export function sliceTopicSession(
  topicSession: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"][0],
): TopicSessionSlice[] {
  // If this topic session spans multiple days, we need to split it into multiple slices
  // We do this by calculating the number of days between the start and end of the session
  // Then we create a slice for each day, and set the start and end times accordingly
  const sessionStart = new Date(topicSession.Session_Start);
  const sessionEnd = topicSession.Session_End
    ? new Date(topicSession.Session_End)
    : new Date();

  // if sessionEnd is not on a different day than sessionStart, early return a single slice
  if (sessionStart.getUTCDate() === sessionEnd.getUTCDate()) {
    return [
      {
        ...topicSession,
        sliceStartMS: sessionStart.getTime(),
        sliceEndMS: sessionEnd.getTime(),
      },
    ];
  }

  // This only runs when the passed session spans multiple days
  const slices: TopicSessionSlice[] = [];
  const sliceStartTime = sessionStart;
  // Initial sliceEndTime is the end of the day of the session start
  let sliceEndTime = new Date(sessionStart);
  sliceEndTime.setHours(23, 59, 59, 999);

  while (sliceEndTime.getTime() < sessionEnd.getTime()) {
    slices.push({
      ...topicSession,
      sliceStartMS: sliceStartTime.getTime(),
      sliceEndMS: sliceEndTime.getTime(),
    });

    // Update slice time for the next slice in the following iteration
    sliceStartTime.setDate(sliceStartTime.getDate() + 1);
    sliceStartTime.setHours(0, 0, 0, 0);
    // sliceEndTime should be the end of the next day, or the end of the session, whichever comes first
    // get the end of the next day
    if (sliceEndTime.getTime() > sessionEnd.getTime()) {
      sliceEndTime = new Date(sliceStartTime);
      sliceEndTime.setHours(23, 59, 59, 999);
    } else {
      sliceEndTime.setDate(sliceEndTime.getDate() + 1);
    }

    if (slices.length === 0) {
      sliceStartTime.setHours(0, 0, 0, 0);
    }

    if (sliceEndTime.getTime() > sessionEnd.getTime()) {
      sliceEndTime = sessionEnd;
    }
  }

  slices.push({
    ...topicSession,
    sliceStartMS: sliceStartTime.getTime(),
    sliceEndMS: sliceEndTime.getTime(),
  });

  return slices;
}

export function setDayOfWeek(date: Date, dayOfWeek: number): Date {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error(
      "Invalid day of week. Only 0 (Sunday) through 6 (Saturday) are allowed.",
    );
  }

  const currentDay = date.getDay();
  let distance = dayOfWeek - currentDay;

  if (distance < 0) {
    distance += 7;
  }

  date.setDate(date.getDate() + distance);
  return date;
}
// Utility function which calculates the bounds based on the current date and a display mode
export function getDisplayDateBounds(
  displayMode: CalendarGridDisplayMode,
  date: Date,
): CalendarGridContextType["displayDateBounds"] {
  switch (displayMode) {
    case CalendarGridDisplayMode.DAY_DISPLAY:
      const startOfToday = new Date(date);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(date);
      endOfToday.setHours(23, 59, 59, 999);
      return {
        beginDate: startOfToday,
        endDate: endOfToday,
      };
    case CalendarGridDisplayMode.WEEK_DISPLAY:
      // Create a new date object at the beginning of the week
      const newStart = setDayOfWeek(new Date(date), 0);
      newStart.setHours(0, 0, 0, 0);
      const newEnd = setDayOfWeek(new Date(date), 6);
      newEnd.setHours(23, 59, 59, 999);
      return {
        beginDate: newStart,
        endDate: newEnd,
      };
    case CalendarGridDisplayMode.MONTH_DISPLAY:
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      console.log(start.toLocaleString(), end.toLocaleString());
      return {
        beginDate: start,
        endDate: end,
      };
  }
}

// Utility function which calculates the page number based on the current display bounds and a display mode
export function getPageNumber(
  displayMode: CalendarGridDisplayMode,
  displayDateBounds: CalendarGridContextType["displayDateBounds"],
): number {
  switch (displayMode) {
    case CalendarGridDisplayMode.DAY_DISPLAY:
      return getDaysSinceUnixEpoch(displayDateBounds.beginDate);
    case CalendarGridDisplayMode.WEEK_DISPLAY:
      return getWeeksSinceUnixEpoch(displayDateBounds.beginDate);
    case CalendarGridDisplayMode.MONTH_DISPLAY:
      return getMonthsSinceUnixEpoch(displayDateBounds.beginDate);
  }
}
