"use client";
import {
  CalendarGridDisplayMode,
  type CalendarGridUserPreferences,
  DaysOfTheWeek,
} from "../_components/calendar-grid/calendar-grid-definitions";
import { useLocalStorage } from "usehooks-ts";

// Custom hook which manages the users preferences for the calendar grid
export function useCalendarGridUserPreferences() {
  const [weekStartsOn, setWeekStartsOn] = useLocalStorage(
    "weekStartsOn",
    DaysOfTheWeek.Monday,
  );

  const [displayMode, setDisplayMode] =
    useLocalStorage<CalendarGridDisplayMode>(
      "displayMode",
      CalendarGridDisplayMode.DAY_DISPLAY,
    );

  return {
    displayMode,
    setDisplayMode,
    weekStartsOn,
    setWeekStartsOn,
  } as CalendarGridUserPreferences;
}
