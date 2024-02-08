"use client";
import { useState } from "react";
import { CalendarGridDisplayMode } from "./calendar-grid-definitions";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";

// This component allows users to change their display preferences for the calendar grid
export function CalendarGridPreferenceEditor() {
  const userPreferences = useUserPreferences();
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
                userPreferences.displayMode ===
                CalendarGridDisplayMode.WEEK_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                userPreferences.setDisplayMode(
                  CalendarGridDisplayMode.WEEK_DISPLAY,
                );
                setDisplayModeOpen(!displayModeOpen);
              }}
            >
              Week
            </Button>
            <Button
              variant={
                userPreferences.displayMode ===
                CalendarGridDisplayMode.DAY_DISPLAY
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                userPreferences.setDisplayMode(
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
