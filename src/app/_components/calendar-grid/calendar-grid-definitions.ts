import { type useTopicSessionsQuery } from "~/app/hooks/use-topic-sessions-query";
import { type RouterOutputs } from "~/trpc/react";

export enum DaysOfTheWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
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

// TODO: Move this to a higher level in the file structure
// The data-item-type attributes used to identify different types of dom elements in the calendar grid
export enum DataItemTypeAttributes {
  // Assigned to <CalendarGridColumn /> elements
  CalendarGridColumn = "calendar-grid-column",
  // Assigned to <DateTimePicker /> elements
  DateTimePicker = "date-time-picker",
  // Assigned to the <TopicSelectorMenu/> element
  TopicSelectorMenu = "topic-selector-menu",
  // Assigned to <CalendarPopup /> elements
  CalendarPopup = "calendar-popup",
  // Assigned to <CalendarGridColumnTimeAreaBox /> elements
  CalendarGridColumnTimeAreaBox = "calendar-grid-column-time-area-box",
  // Assigned to the Calendar grid scroll area parent element
  CalendarGridScrollArea = "calendar-grid-scroll-area",
}

// We break down topic sessions into slices so that we can display sessions that span multiple days
// This object is the same as a topic session, but with two new properties, sliceStartMS and sliceEndMS (which indicate the start and end of the slice in ms)
export type TopicSessionSlice =
  RouterOutputs["topicSession"]["getTopicSessionsInDateRange"][0] & {
    sliceStartMS: number;
    sliceEndMS: number;
  };

// The type of the data stored in the context
export interface CalendarGridContextData {
  // DOM ref to the current time bar element
  currentTimeElementRef: React.RefObject<HTMLDivElement> | null;
  // DOM ref to the active popup element (if it exists)
  activePopupElementRef: React.RefObject<HTMLElement> | null;
  // Id of the dom element corresponding to the active popup element
  activePopupElementId: string | null;

  // Ref to the scroll area (where the calendar grid columns are rendered inside)
  scrollAreaElementRef: React.RefObject<HTMLDivElement> | null;

  // Function which sets the active popup element id
  setActivePopupElementId: (id: string | null) => void;

  // The bounds (beginning and end) of the date range that is being displayed
  displayDateBounds: { beginDate: Date; endDate: Date };

  // Function which sets the display date bounds
  setDisplayDateBounds: (beginDate: Date, endDate: Date) => void;

  // Functions which increments & decrement the page
  incrementPage: () => void;
  decrementPage: () => void;

  // Ref to the time column element
  // Used to calculate the offset of the time header
  timeColumnRef: React.RefObject<HTMLDivElement> | null;

  // Setter which controls the zoomLevel state
  setZoomLevel: (zoomLevel: number) => void;
  // This corresponds to the amount of cells needed to display a single hour
  // In other words, it is a cellToHourRatio. For example, if zoomLevel is 2, then 2 cells are needed to display a single hour (48 cells for 24 hours)
  zoomLevel: number;

  // The height (in pixels) of a single cell
  // This is important because it is used to calculate the height of the calendar grid and align the time column
  cellHeightPx: number;
  // Update the cell height
  setCellHeightPx: (cellHeightPx: number) => void;

  // Indicates the amount of minutes that a cell currently represents (based on the zoom level)
  minutesPerCell: number;

  // An array of all topic sessions that have been fetched thus far
  // Our react query hook will handle the fetching and caching of this data
  topicSessionsQuery: ReturnType<typeof useTopicSessionsQuery> | null;

  // Map of day of week to session slices within that day
  daySessionSliceMap: Record<
    number,
    { day: Date; topicSessionSlices: TopicSessionSlice[] }
  >;

  // Function which removes topic session slices associated with a topic session id from the map
  removeSessionSlicesFromMap: (topicSessionId: string) => void;
  // Function which adds a topic session slice to the map
  addSessionSliceToMap: (slice: TopicSessionSlice) => void;
  // Mark a topic session id as unprocessed (it will be reprocessed on the next render)
  markSessionIdAsUnprocessed: (topicSessionId: string) => void;
  // Get all session slices in the map associated with a single topic session id
  getSessionSlicesByTopicSessionId: (
    topicSessionId: string,
  ) => TopicSessionSlice[] | undefined;
}
