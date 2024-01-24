"use client";
import { useState } from "react";
import {
  CalendarGridDisplayMode,
  DaysOfTheWeek,
} from "../_components/calendar-grid/calendar-grid-definitions";
import { useLocalStorage } from "usehooks-ts";

// Preferences for how the user on how the site and calendar grid should be displayed / behave
export interface UserPreferences {
  weekStartsOn: DaysOfTheWeek;
  displayMode: CalendarGridDisplayMode;
  dateTimeFormatOptions: Intl.DateTimeFormatOptions;
  setDisplayMode: (displayMode: CalendarGridDisplayMode) => void;
}

// Custom hook which manages the users preferences for the calendar grid
export function useUserPreferences() {
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
  } as UserPreferences;
}
