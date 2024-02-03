"use client";
import { useRef } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarGridPreferenceEditor } from "./calendar-grid-preference-editor";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";
import { CalendarGridControls } from "./calendar-grid-controls";
import { CalendarGridColumnRenderer } from "./calendar-grid-column-renderer";
import { CalendarGridCurrentTimeBar } from "./calendar-grid-current-time-bar";
import { CalendarGridTimeHeader } from "./calendar-grid-time-header";
import { useOnInitialCalendarLoad } from "~/app/hooks/use-on-initial-calendar-load";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";

// Responsible for rendering the calendar grid and its child components
export function CalendarGrid() {
  const calendarGridContext = useCalendarGrid();
  const calendarGridDomRef = useRef<HTMLDivElement>(null);
  const calendarGridTimeColumnRef = useRef<HTMLDivElement>(null);

  const { isClient } = useOnInitialCalendarLoad();

  return (
    <div className="mt-2 h-fit w-full rounded-lg" ref={calendarGridDomRef}>
      <CalendarGridPreferenceEditor />

      <p>Zoom level: {calendarGridContext.zoomLevel}</p>
      <p>Cell height: {calendarGridContext.cellHeightPx}</p>

      <CalendarGridControls />

      <p>
        Sessions in this period:{" "}
        {calendarGridContext.topicSessionsQuery?.data?.length ?? 0}
      </p>
      {isClient && <CalendarGridTimeHeader />}
      <ScrollArea className="h-fit">
        <ScrollBar className="z-[1]" />
        {isClient ? (
          <>
            <div className="relative flex max-h-[900px] w-full">
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
