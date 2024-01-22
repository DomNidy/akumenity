"use client";
import { createContext, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  getDayjsUnitFromDisplayMode,
  getDisplayDateBounds,
  sliceTopicSession,
} from "~/lib/utils";
import { useDaySessionMap } from "~/app/hooks/use-day-session-map";
import {
  type CalendarGridContextType,
  CalendarGridDisplayMode,
  DaysOfTheWeek,
} from "./calendar-grid-definitions";
import dayjs from "dayjs";
import { useCalendarGridUserPreferences } from "~/app/hooks/use-calendar-grid-user-preferences";

// The calendar grid and its child components read data from this context (avoiding prop drilling)
export const CalendarGridContext = createContext<CalendarGridContextType>({
  incrementPage: () => {
    throw new Error("incrementPage not implemented");
  },
  decrementPage: () => {
    throw new Error("decrementPage not implemented");
  },

  userPreferences: {
    weekStartsOn: DaysOfTheWeek.Monday,
    displayMode: CalendarGridDisplayMode.WEEK_DISPLAY,
    setDisplayMode: () => {
      throw new Error("setDisplayMode not implemented");
    },
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
  zoomLevel: 0,
  topicSessions: [],
  daySessionSliceMap: {},
  cellHeightPx: 60,
});

// This component wraps & provides the context to the calendar grid and its child components
export function CalendarGridProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The user's display preferences (read from local storage)
  const userPreferences = useCalendarGridUserPreferences();

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

  // Height of a single cell in the calendar grid
  const [cellHeightPx, _setCellHeightPx] = useState(60);

  // The zoom level
  const [zoomLevel, _setZoomLevel] = useState(1);

  const topicSessionsQuery =
    api.topicSession.getTopicSessionsInDateRange.useQuery({
      // Get the current week number, then multiply it to get a millisecond timestamp for when that week started
      dateRange: {
        startTimeMS: displayDateBounds.beginDate.getTime(),
        endTimeMS: displayDateBounds.endDate.getTime(),
      },
    });

  // Custom hook which manages the daySessionMap & its state
  const daySessionMap = useDaySessionMap();

  // Slice the topic sessions, and then add them to the daySessionMap when query data changes
  useEffect(() => {
    topicSessionsQuery.data?.forEach((topicSession) => {
      // If the session has already been processed, skip it
      if (daySessionMap.isSessionIdProcessed(topicSession.SK)) return;
      sliceTopicSession(topicSession).forEach((topicSessionSlice) => {
        daySessionMap.addSessionSliceToMap(topicSessionSlice);
      });
      daySessionMap.markSessionIdAsProcessed(topicSession.SK);
    });
  }, [topicSessionsQuery.data]);

  // Whenever the users display preferences change, update the display bounds
  useEffect(() => {
    console.log("display mode changed, effect ran");

    _setDisplayDateBounds(
      getDisplayDateBounds(
        userPreferences.displayMode,
        displayDateBounds.beginDate,
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
    userPreferences,
    displayDateBounds,
    zoomLevel,
    // Ensure zoom level is always at least 1
    setZoomLevel: (lvl: number) =>
      _setZoomLevel(lvl <= 0 ? 1 : lvl >= 12 ? 11 : lvl),
    topicSessions: topicSessionsQuery.data ?? [],
    daySessionSliceMap: daySessionMap.daySessionMap,
    cellHeightPx: cellHeightPx,
    setCellHeightPx: _setCellHeightPx,
  };

  // This component provides the context to its child components
  return (
    <CalendarGridContext.Provider value={value}>
      {children}
    </CalendarGridContext.Provider>
  );
}
