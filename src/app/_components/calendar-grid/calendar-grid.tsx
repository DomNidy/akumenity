"use client";
import { useContext, useRef } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { CalendarGridColumn } from "./calendar-grid-column";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarGridDisplayMode } from "./calendar-grid-definitions";
import dayjs from "dayjs";
import { CalendarGridPreferenceEditor } from "./calendar-grid-preference-editor";

export function CalendarGrid() {
  const calendarGridContext = useContext(CalendarGridContext);
  const calendarGridDomRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="mt-2 h-fit w-full rounded-lg bg-blue-500 px-8 sm:px-2"
      ref={calendarGridDomRef}
    >
      <CalendarGridPreferenceEditor />
      <p>
        Start of week:{" "}
        {calendarGridContext.displayDateBounds.beginDate.toDateString()}
      </p>
      <p>
        End of week:{" "}
        {calendarGridContext.displayDateBounds.endDate.toDateString()}
      </p>
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.decrementPage();
          }}
        >
          Prev
        </Button>
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.incrementPage();
          }}
        >
          Next
        </Button>
      </div>

      <p>Zoom level: {calendarGridContext.zoomLevel}</p>
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          disabled={calendarGridContext.zoomLevel <= 1}
          onClick={() => {
            calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel - 1);
          }}
        >
          <ZoomOut />
        </Button>
        <Button
          className="aspect-square p-0"
          disabled={calendarGridContext.zoomLevel >= 11}
          onClick={() => {
            calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel + 1);
          }}
        >
          <ZoomIn />
        </Button>
      </div>

      <p>Cell height: {calendarGridContext.cellHeightPx}</p>
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          disabled={calendarGridContext.cellHeightPx <= 6}
          onClick={() => {
            calendarGridContext.setCellHeightPx(
              calendarGridContext.cellHeightPx - 5,
            );
          }}
        >
          -
        </Button>
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.setCellHeightPx(
              calendarGridContext.cellHeightPx + 5,
            );
          }}
        >
          +
        </Button>
      </div>

      <Button
        className="mt-2"
        onClick={() => {
          calendarGridContext.setCellHeightPx(60);
          calendarGridContext.setZoomLevel(1);
        }}
      >
        Reset view
      </Button>

      <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
      <ScrollArea className="h-fit">
        <ScrollBar className="z-[60]" />
        <div className="flex max-h-[900px] w-full ">
          <CalendarGridTimeColumn />
          {[
            ...Array(
              calendarGridContext.userPreferences.displayMode ===
                CalendarGridDisplayMode.MONTH_DISPLAY
                ? dayjs().daysInMonth()
                : calendarGridContext.userPreferences.displayMode ===
                    CalendarGridDisplayMode.WEEK_DISPLAY
                  ? 7
                  : 1,
            ).keys(),
          ].map((value, index) => {
            // The day this column will represent data for (-2 to display the week starting on monday)
            // Read day the bounds start
            const columnDay = dayjs(
              calendarGridContext.displayDateBounds.beginDate,
            ).add(index, "day");

            console.log(index);

            return (
              <div key={index} className="w-full">
                <CalendarGridColumn day={columnDay.toDate()} />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
