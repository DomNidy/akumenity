import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RouterOutputs } from "~/trpc/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
// * Since this function interacts with the backend (used in TopicSession query), we convert the passed date to UTC time.
export function getWeekStartAndEnd(date: Date) {
  // Start with a date object at 12:00:00 AM on the given date
  const start = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const end = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

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

// TODO: Make tests for this function
// Function which returns the week number (number of weeks that have occured since epoch) in which the date passed as an argument falls.
// The passed date is assumed to be local time.
export function getWeekNumberSinceUnixEpoch(date: Date) {
  // We convert the date to local time just to be safe
  const { startTimeMS } = getWeekStartAndEnd(UTCToLocalDate(date));

  return Math.floor(startTimeMS / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// Function that converts UTC date to local time date
export function UTCToLocalDate(date: Date) {
  const offset = date.getTimezoneOffset();
  const newDate = new Date(date.getTime() - offset * 60 * 1000);
  return newDate;
}

// Function that converts local time date to UTC date
export function localToUTCDate(date: Date) {
  const offset = date.getTimezoneOffset();
  const newDate = new Date(date.getTime() + offset * 60 * 1000);
  return newDate;
}

// When given a an integer n, returns the date n days from the current date
export function getDateForDayRelativeToCurrentDate(day: number) {
  const date = new Date();
  const diff = date.getDate() - date.getDay() + day;
  return new Date(date.setDate(diff));
}

// Creates the daySessionMap (used in CalendarGridContext) when given a list of sessions
export function mapSessionsToDays(
  topicSessions: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"],
  currentWeek: number,
) {
  return (
    topicSessions?.reduce(
      (acc, session) => {
        const dayOfWeek = new Date(session.Session_Start).getDay();

        const map: Record<
          number,
          {
            day: Date;
            topicSessions: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"];
          }
        > = {
          ...acc,
          [dayOfWeek]: {
            day: new Date(new Date(session.Session_Start).setHours(0, 0, 0, 0)),
            topicSessions: [session, ...(acc[dayOfWeek]?.topicSessions ?? [])],
          },
        };

        return map;
      },
      Array.from({ length: 7 }, (val, index) => ({
        day:
          // TODO: Refactor this and the above code to be more readable
          // This is really confusing, but basically we want to get the date for a day N days away from the current date
          // The index ranges from 0 to 6, since we are mapping over an array of length 7
          // We then calculate the difference between the currentWeek the calendar is displaying data for, and the current week (in real time)
          // We then multiply that difference by 7, since there are 7 days in a week
          // Then we subtract that difference from the index
          // * currentWeek is the week the calendar is displaying data for, not the actual current week (in real time)
          new Date(
            getDateForDayRelativeToCurrentDate(
              index -
                7 * (getWeekNumberSinceUnixEpoch(new Date()) - currentWeek),
            ).setHours(0, 0, 0, 0),
          ),
        topicSessions: [],
      })) as Record<
        number,
        {
          day: Date;
          topicSessions: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"];
        }
      >,
    ) ?? {}
  );
}
