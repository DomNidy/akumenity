import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type z } from "zod";
import {
  type TopicSessionSlice,
  CalendarGridDisplayMode,
  type CalendarGridContextData,
  type DaysOfTheWeek,
} from "~/app/_components/calendar-grid/calendar-grid-definitions";
import dayjs, { type Dayjs } from "dayjs";
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
// Example format: (1 hour, 30 minutes, 35 seconds would be 1:30:35)
// Function which returns the time since a current timestamp (in ms) and a previous timestamp (in ms) in a human readable format.
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
// Function which returns the timezone offset in miliseconds
export function getTimezoneOffsetMS() {
  return new Date().getTimezoneOffset() * 60 * 1000;
}

// TODO: This function is also running when we have a useRefreshInterval hook, so that suggests our CalendarContextProvider is being re-rendered unnecessarily, fix this
// TODO: Write tests for this function, this is really important and what places the topic sessions into the correct spot in the day session map
// Function which returns the days since unix epoch (January 1, 1970) for a given date
export function getDaysSinceUnixEpoch(date: Date) {
  const daysSince = dayjs(date).diff(dayjs.unix(0), "day");
  return daysSince;
}

// TODO: Write tests for this
// Function which returns the date from a daySinceUnixEpoch integer, basically the inverse of getDaysSinceUnixEpoch
export function getDateFromDaysSinceUnixEpoch(daysSince: number) {
  const date = dayjs
    .unix(0)
    .add(daysSince, "day")
    .add(getTimezoneOffsetMS(), "ms")
    .toDate();
  return date;
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

// Utility function which calculates the bounds based on the current date and a display mode
// date: A day in which we should calculate the bounds
export function getDisplayDateBounds(
  displayMode: CalendarGridDisplayMode,
  date: Date,
  weekStartsOn: DaysOfTheWeek,
): CalendarGridContextData["displayDateBounds"] {
  switch (displayMode) {
    case CalendarGridDisplayMode.DAY_DISPLAY:
      const startDay = dayjs(date).startOf("day").toDate();
      const endDay = dayjs(date).endOf("day").toDate();

      return {
        beginDate: startDay,
        endDate: endDay,
      };
    case CalendarGridDisplayMode.WEEK_DISPLAY:
      // TODO: FIX THIS: On sundays, the following week is being displayed on initial load instead of the current week
      // TODO: Believe it has to do with how we're adding days and setting start of week
      // Create a new date object at the beginning of the week
      const startWeek = dayjs(date)
        .startOf("week")
        .add(weekStartsOn, "d")
        .toDate();

      const endWeek = dayjs(startWeek)
        .endOf("week")
        .add(weekStartsOn, "d")
        .toDate();

      return {
        beginDate: startWeek,
        endDate: endWeek,
      };
    case CalendarGridDisplayMode.MONTH_DISPLAY:
      const startMonth = dayjs(date).startOf("month").toDate();
      const endMonth = dayjs(date).endOf("month").toDate();

      return {
        beginDate: startMonth,
        endDate: endMonth,
      };
  }
}

// Utility function that maps a display mode to the relative dayjs unit
export function getDayjsUnitFromDisplayMode(
  displayMode: CalendarGridDisplayMode,
): dayjs.ManipulateType {
  switch (displayMode) {
    case CalendarGridDisplayMode.DAY_DISPLAY:
      return "day";
    case CalendarGridDisplayMode.WEEK_DISPLAY:
      return "week";
    case CalendarGridDisplayMode.MONTH_DISPLAY:
      return "month";
  }
}

// Calculates how many pixels of height a topic session should be based on the start and end times of the session
// The duration of the session in ms, divided by the number of ms in an hour, multiplied by the height of an hour in pixels
export function calculateTopicSessionHeightInPixels(
  sessionStartMS: number,
  sessionEndMS: number,
  hourHeightInPx: number,
) {
  return ((sessionEndMS - sessionStartMS) / (1000 * 60 * 60)) * hourHeightInPx;
}

// Utility function which returns the amount of grid columns that should be rendered based a display mode, and current date (for month display mode)
export function calculateGridColumnCount(
  displayMode: CalendarGridDisplayMode,
  date: Dayjs,
) {
  switch (displayMode) {
    case CalendarGridDisplayMode.DAY_DISPLAY:
      return 1;
    case CalendarGridDisplayMode.WEEK_DISPLAY:
      return 7;
    case CalendarGridDisplayMode.MONTH_DISPLAY:
      return date.daysInMonth();
  }
}

// Utility function which sums up the durations of a list of topic session slices
export function calculateDurationsOfSlices(
  slices: TopicSessionSlice[],
): number {
  return slices.reduce((acc, slice) => {
    return acc + (slice.sliceEndMS - slice.sliceStartMS);
  }, 0);
}

// Calculate the total difference between session.StartTime and session.EndTime
export function calculateTotalDifference(
  recentSessions:
    | z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>[]
    | null,
) {
  return recentSessions?.reduce((total, session) => {
    // We use a nullish coalescing operator on session.Session_End because it may be null
    const difference =
      (session.Session_End ?? session.Session_Start) - session.Session_Start ??
      0;
    return total + difference;
  }, 0);
}
