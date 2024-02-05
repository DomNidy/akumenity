"use client";
import { createContext, useEffect, useRef, useState } from "react";
import { getDayjsUnitFromDisplayMode, getDisplayDateBounds } from "~/lib/utils";
import { useDaySessionMap } from "~/app/hooks/use-day-session-map";
import {
  type CalendarGridContextType,
  CalendarGridDisplayMode,
  DaysOfTheWeek,
} from "./calendar-grid-definitions";
import dayjs from "dayjs";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { HoveredCalendarItemProvider } from "./calendar-grid-hovered-topic-session-context";
import { useTopicSessionsQuery } from "~/app/hooks/use-topic-sessions-query";

// The calendar grid and its child components read data from this context (avoiding prop drilling)
export const CalendarGridContext = createContext<CalendarGridContextType>({
  incrementPage: () => {
    throw new Error("incrementPage not implemented");
  },
  decrementPage: () => {
    throw new Error("decrementPage not implemented");
  },

  setZoomLevel: () => {
    throw new Error("setZoomLevel not implemented");
  },
  setCellHeightPx: () => {
    throw new Error("setCellHeightPx not implemented");
  },
  displayDateBounds: getDisplayDateBounds(
    CalendarGridDisplayMode.WEEK_DISPLAY,
    new Date(),
    DaysOfTheWeek.Monday,
  ),
  setDisplayDateBounds: () => {
    throw new Error("setDisplayDateBounds not implemented");
  },
  zoomLevel: 0,
  topicSessionsQuery: null,
  daySessionSliceMap: {},
  cellHeightPx: 60,
  currentTimeElementRef: null,
  timeColumnRef: null,
  removeSessionSlicesFromMap: () => {
    throw new Error("removeSessionSlicesFromMap not implemented");
  },
  addSessionSliceToMap: () => {
    throw new Error("addSessionSliceToMap not implemented");
  },
  markSessionIdAsUnprocessed: () => {
    throw new Error("markSessionIdAsUnprocessed not implemented");
  },
  getSessionSlicesByTopicSessionId: () => {
    throw new Error("getSessionSlicesByTopicSessionId not implemented");
  },
});

// This component wraps & provides the context to the calendar grid and its child components
export function CalendarGridProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The user's display preferences (read from local storage)
  const userPreferences = useUserPreferences();

  // Bounds (date range) of the data being displayed
  const [displayDateBounds, _setDisplayDateBounds] = useState<
    CalendarGridContextType["displayDateBounds"]
  >(
    getDisplayDateBounds(
      userPreferences.displayMode,
      new Date(),
      userPreferences.weekStartsOn,
    ),
  );

  // Ref to the time column
  const timeColumnRef = useRef<HTMLDivElement>(null);

  // Height of a single cell in the calendar grid
  const [cellHeightPx, _setCellHeightPx] = useState(60);

  // The zoom level
  const [zoomLevel, _setZoomLevel] = useState(1);

  // Dom ref to the current time element
  const currentTimeElementRef = useRef<HTMLDivElement>(null);

  // Custom hook which manages the daySessionMap & its state
  const daySessionMap = useDaySessionMap();

  // This query is where all the topic sessions are fetched from
  // React query handles caching and refetching automatically
  const topicSessionsQuery = useTopicSessionsQuery({
    endTimeMS: displayDateBounds.endDate.getTime(),
    startTimeMS: displayDateBounds.beginDate.getTime(),
  });

  //* Important: This effect is responsible for adding data to the daySessionMap
  // When the query data changes, send them to the daySessionMap for processing
  useEffect(() => {
    console.log("Topic sessions query data changed", topicSessionsQuery.data);
    daySessionMap.sliceAndAddTopicSessionsToMap(topicSessionsQuery.data ?? []);
  }, [topicSessionsQuery.data]);

  // Whenever the users display preferences change, update the display bounds
  // This is important as the topic sessions query depends on the display bounds
  useEffect(() => {
    _setDisplayDateBounds(
      getDisplayDateBounds(
        userPreferences.displayMode,
        // We use new Date() here instead of displayDateBounds.beginDate because if we swap from weekly to daily view, we want to start at the current day
        new Date(),
        userPreferences.weekStartsOn,
      ),
    );
  }, [userPreferences.displayMode, userPreferences.weekStartsOn]);

  // The context made available to child components
  const value: CalendarGridContextType = {
    decrementPage() {
      const newBounds = getDisplayDateBounds(
        userPreferences.displayMode,
        displayDateBounds.beginDate,
        userPreferences.weekStartsOn,
      );

      // Decrement beginDate and endDate of newBounds depending on display mode
      const _start = dayjs(newBounds.beginDate)
        .subtract(1, getDayjsUnitFromDisplayMode(userPreferences.displayMode))
        .toDate();

      const _end = dayjs(newBounds.endDate)
        .subtract(1, getDayjsUnitFromDisplayMode(userPreferences.displayMode))
        .toDate();

      // Decrement the display bounds by 1 week
      _setDisplayDateBounds({
        beginDate: _start,
        endDate: _end,
      });
    },
    incrementPage() {
      const newBounds = getDisplayDateBounds(
        userPreferences.displayMode,
        displayDateBounds.beginDate,
        userPreferences.weekStartsOn,
      );

      // Increment beginDate and endDate of newBounds depending on display mode
      const _start = dayjs(newBounds.beginDate)
        .add(1, getDayjsUnitFromDisplayMode(userPreferences.displayMode))
        .toDate();

      const _end = dayjs(newBounds.endDate)
        .add(1, getDayjsUnitFromDisplayMode(userPreferences.displayMode))
        .toDate();

      // Increment the display bounds by 1 week
      _setDisplayDateBounds({
        beginDate: _start,
        endDate: _end,
      });
    },
    displayDateBounds,
    setDisplayDateBounds: (beginDate: Date, endDate: Date) =>
      _setDisplayDateBounds({ beginDate, endDate }),
    zoomLevel,
    // Ensure zoom level is always at least 1
    setZoomLevel: (lvl: number) =>
      _setZoomLevel(lvl <= 0 ? 1 : lvl >= 12 ? 11 : lvl),
    topicSessionsQuery: topicSessionsQuery,
    daySessionSliceMap: daySessionMap.daySessionMap,
    cellHeightPx: cellHeightPx,
    setCellHeightPx: _setCellHeightPx,
    currentTimeElementRef,
    timeColumnRef,
    removeSessionSlicesFromMap: daySessionMap.removeSessionSlicesFromMap,
    addSessionSliceToMap: daySessionMap.addSessionSliceToMap,
    markSessionIdAsUnprocessed: daySessionMap.markSessionIdAsUnprocessed,
    getSessionSlicesByTopicSessionId:
      daySessionMap.getSessionSlicesByTopicSessionId,
  };

  // This component provides the context to its child components
  return (
    <CalendarGridContext.Provider value={value}>
      <HoveredCalendarItemProvider>{children}</HoveredCalendarItemProvider>
    </CalendarGridContext.Provider>
  );
}
