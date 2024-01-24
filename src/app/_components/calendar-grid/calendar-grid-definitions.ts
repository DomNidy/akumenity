import { type RouterOutputs } from "~/trpc/react";

export enum DaysOfTheWeek {
  Sunday = 2,
  Monday = 1,
  Tuesday = 0,
  Wednesday = -1,
  Thursday = -2,
  Friday = -3,
  Saturday = -4,
}

// Determines the logic used to render out pages.
/**
 * DAY_DISPLAY: will render out a single day
 * WEEK_DISPLAY: will render out a single week
 * MONTH_DISPLAY: will render out a single month
 */
export enum CalendarGridDisplayMode {
  DAY_DISPLAY = "day_display",
  WEEK_DISPLAY = "week_display",
  MONTH_DISPLAY = "month_display",
}

// We break down topic sessions into slices so that we can display sessions that span multiple days
// This object is the same as a topic session, but with two new properties, sliceStartMS and sliceEndMS (which indicate the start and end of the slice in ms)
export type TopicSessionSlice =
  RouterOutputs["topicSession"]["getTopicSessionsInDateRange"][0] & {
    sliceStartMS: number;
    sliceEndMS: number;
  };

// The type of the data stored in the context
export interface CalendarGridContextType {
  // Specifies user preferences for the calendar grid (such as when the week starts, etc.)
  userPreferences: CalendarGridUserPreferences;

  // The id of the element (in the DOM, which is placed by GridTimeColumn) which displays the current time
  currentTimeElementId: string;
  // DOM ref to the current time element
  currentTimeElementRef: React.RefObject<HTMLDivElement> | null;

  // The bounds (beginning and end) of the date range that is being displayed
  displayDateBounds: { beginDate: Date; endDate: Date };

  // Functions which increments & decrement the page
  incrementPage: () => void;
  decrementPage: () => void;

  // Wrapper which controls the zoomLevel state
  setZoomLevel: (zoomLevel: number) => void;
  // This corresponds to the amount of cells needed to display a single hour
  // In other words, it is a cellToHourRatio. For example, if zoomLevel is 2, then 2 cells are needed to display a single hour (48 cells for 24 hours)
  zoomLevel: number;

  // An array of all topic sessions that have been fetched thus far
  // Our react query hook will handle the fetching and caching of this data
  topicSessions: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"];

  // Map of day of week to session slices within that day
  daySessionSliceMap: Record<
    number,
    { day: Date; topicSessionSlices: TopicSessionSlice[] }
  >;

  // The height (in pixels) of a single cell
  // This is important because it is used to calculate the height of the calendar grid and align the time column
  cellHeightPx: number;
  // Update the cell height
  setCellHeightPx: (cellHeightPx: number) => void;
}

// TODO: Move cellHeightPx, zoomLevel here
// Preferences for how the user wants to view the calendar grid
export interface CalendarGridUserPreferences {
  weekStartsOn: DaysOfTheWeek;
  displayMode: CalendarGridDisplayMode;
  dateTimeFormatOptions: Intl.DateTimeFormatOptions;
  setDisplayMode: (displayMode: CalendarGridDisplayMode) => void;
}
