"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarGridPreferenceEditor } from "./calendar-grid-preference-editor";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";
import { CalendarGridControls } from "./calendar-grid-controls";
import { CalendarGridColumnRenderer } from "./calendar-grid-column-renderer";
import { CalendarGridCurrentTimeBar } from "./calendar-grid-current-time-bar";
import { CalendarGridTimeHeader } from "./calendar-grid-time-header";

// Responsible for rendering the calendar grid and its child components
export function CalendarGrid() {
  const calendarGridContext = useContext(CalendarGridContext);
  const calendarGridDomRef = useRef<HTMLDivElement>(null);
  const calendarGridTimeColumnRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    console.log("Rendered parent");
  });

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
      <p>Zoom level: {calendarGridContext.zoomLevel}</p>
      <p>Cell height: {calendarGridContext.cellHeightPx}</p>

      <CalendarGridControls />

      <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
      {isClient && <CalendarGridTimeHeader />}
      <ScrollArea className="h-fit">
        <ScrollBar className="z-[51]" />
        {isClient ? (
          <>
            <div className="relative flex max-h-[900px]  w-full">
              <CalendarGridTimeColumn />
              <CalendarGridColumnRenderer />
              <CalendarGridCurrentTimeBar
                calendarGridTimeColumnRef={calendarGridTimeColumnRef}
              />
            </div>
          </>
        ) : (
          <div className="flex h-[900px] max-h-[900px] w-full items-center justify-center text-center text-3xl">
            Loading calendar
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
