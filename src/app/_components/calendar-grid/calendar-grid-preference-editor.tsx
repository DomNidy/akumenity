"use client";
import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridDisplayMode } from "./calendar-grid-definitions";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";

// This component allows users to change their display preferences for the calendar grid
export function CalendarGridPreferenceEditor() {
  const calendarGridContext = useContext(CalendarGridContext);

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"}>Display Mode</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col">
            <Button
              variant={
                calendarGridContext.displayPreferences.displayMode ===
                CalendarGridDisplayMode.WEEK_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                calendarGridContext.displayPreferences.setDisplayMode(
                  CalendarGridDisplayMode.WEEK_DISPLAY,
                );
              }}
            >
              Week
            </Button>
            <Button
              variant={
                calendarGridContext.displayPreferences.displayMode ===
                CalendarGridDisplayMode.DAY_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                calendarGridContext.displayPreferences.setDisplayMode(
                  CalendarGridDisplayMode.DAY_DISPLAY,
                );
              }}
            >
              Day
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
