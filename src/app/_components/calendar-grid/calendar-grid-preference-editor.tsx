"use client";
import { useContext, useState } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridDisplayMode } from "./calendar-grid-definitions";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";

// This component allows users to change their display preferences for the calendar grid
export function CalendarGridPreferenceEditor() {
  const calendarGridContext = useContext(CalendarGridContext);

  const [displayModeOpen, setDisplayModeOpen] = useState(false);

  return (
    <div>
      <Popover open={displayModeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => setDisplayModeOpen(!displayModeOpen)}
          >
            Display Mode
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div
            className="flex flex-col"
            onBlur={() => {
              console.log("blur");
              setDisplayModeOpen(!displayModeOpen);
            }}
          >
            <Button
              variant={
                calendarGridContext.userPreferences.displayMode ===
                CalendarGridDisplayMode.WEEK_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClickCapture={() => {
                calendarGridContext.userPreferences.setDisplayMode(
                  CalendarGridDisplayMode.WEEK_DISPLAY,
                );
                setDisplayModeOpen(!displayModeOpen)
              }}
            >
              Week
            </Button>
            <Button
              variant={
                calendarGridContext.userPreferences.displayMode ===
                CalendarGridDisplayMode.DAY_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClickCapture={() => {
                calendarGridContext.userPreferences.setDisplayMode(
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
