"use client";
import { useState } from "react";
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
      CalendarGridDisplayMode.WEEK_DISPLAY,
    );

  const [dateTimeFormatOptions, setDateTimeFormatOptions] =
    useState<Intl.DateTimeFormatOptions>({
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  return {
    displayMode,
    setDisplayMode,
    weekStartsOn,
    setWeekStartsOn,
    dateTimeFormatOptions,
    setDateTimeFormatOptions,
  } as CalendarGridUserPreferences;
}
