"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { CalendarGridColumn } from "./calendar-grid-column";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarGridDisplayMode } from "./calendar-grid-definitions";
import dayjs from "dayjs";
import { CalendarGridPreferenceEditor } from "./calendar-grid-preference-editor";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";

export function CalendarGrid() {
  const calendarGridContext = useContext(CalendarGridContext);
  const calendarGridDomRef = useRef<HTMLDivElement>(null);

  // This state is used to prevent the CalendarGrid from rendering data that would cause a hydration errors
  // Things like weekStartsOn, displayMode, etc. are read from local storage and would cause dom mismatches
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // When we're on the client, scroll to the current time element, need to use different effects because state updates are async
  // If we tried to scroll to the dom element as soon as our client state was set, we wouldnt of rendered that dom element out yet
  useEffect(() => {
    calendarGridContext.currentTimeElementRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [isClient]);

  return (
    <div
      className="z-0 mt-2 h-fit w-full rounded-lg bg-blue-500 px-8 sm:px-2"
      ref={calendarGridDomRef}
    >
      <CalendarGridPreferenceEditor />
      {isClient && (
        <>
          <p>
            Start of period:{" "}
            {calendarGridContext.displayDateBounds.beginDate.toDateString()}
          </p>
          <p>
            End of period:{" "}
            {calendarGridContext.displayDateBounds.endDate.toDateString()}
          </p>
        </>
      )}
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

      <Button
        className="mt-2"
        onClick={() => {
          calendarGridContext.currentTimeElementRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }}
      >
        Go to current time
      </Button>

      <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
      <ScrollArea className="h-fit">
        <ScrollBar className="z-50" />
        {isClient ? (
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
              // columnDay is the day that each CalendarGridColumn should render topic sessions for
              // columnDay is converted to a day number (days since unix epoch), then used as a key to the daySessionSliceMap which contains the topic sessions for that day
              const columnDay = dayjs(
                calendarGridContext.displayDateBounds.beginDate,
              ).add(index, "day");

              return (
                <div key={index} className="w-full">
                  <p className="absolute z-50 w-full bg-blue-800">
                    {columnDay.toDate().toDateString()}
                  </p>
                  <CalendarGridColumn day={columnDay.toDate()} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[900px] max-h-[900px] w-full items-center justify-center text-center text-3xl">
            Loading calendar
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
