"use client";
// Custom hook which determines if a row in the time column should be the our current time element
// This is used to highlight the current time, and keep a ref to it (so we can scroll to it)
import { useContext, useMemo } from "react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";

export function useIsCurrentTimeColumnRow(
  // The index of the row in the time column (decided by the map function in the time column)
  // There are 24*zoomLevel rows in the time column
  timeColumnRowIndex: number,
) {
  const calendarGridContext = useContext(CalendarGridContext);

  return useMemo(() => {
    return (
      timeColumnRowIndex.toString() === calendarGridContext.currentTimeElementId
    );
  }, [
    timeColumnRowIndex,
    calendarGridContext.zoomLevel,
    calendarGridContext.currentTimeElementId,
  ]);
}
