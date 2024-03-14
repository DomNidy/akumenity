"use client";
import { useRef } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarGridPreferenceEditor } from "./calendar-grid-preference-editor";
import { CalendarGridTimeColumn } from "./time-column/calendar-grid-time-column";
import { CalendarGridControls } from "./calendar-grid-controls";
import { CalendarGridColumnRenderer } from "./grid-columns/calendar-grid-column-renderer";
import { CalendarGridCurrentTimeBar } from "./calendar-grid-current-time-bar";
import { CalendarGridTimeHeader } from "./time-header/calendar-grid-time-header";
import { useOnInitialCalendarLoad } from "~/app/_components/calendar-grid/hooks/use-on-initial-calendar-load";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import { CalendarGridPopupProvider } from "./popup/calendar-popup-context";
import { DataItemTypeAttributes } from "./calendar-grid-definitions";

// Responsible for rendering the calendar grid and its child components
export function CalendarGrid() {
  const calendarGridContext = useCalendarGrid();
  const calendarGridDomRef = useRef<HTMLDivElement>(null);
  const calendarGridTimeColumnRef = useRef<HTMLDivElement>(null);

  const { isClient } = useOnInitialCalendarLoad();

  return (
    <CalendarGridPopupProvider calendarGridContext={calendarGridContext}>
      <div className="mt-2 h-fit w-full rounded-lg " ref={calendarGridDomRef}>
        <CalendarGridPreferenceEditor />

        <p>Zoom level: {calendarGridContext.zoomLevel}</p>
        <p>Cell height: {calendarGridContext.cellHeightPx}</p>

        <CalendarGridControls />

        <p>
          Sessions in this period:{" "}
          {calendarGridContext.topicSessionsQuery?.data?.length ?? 0}
        </p>
        {isClient && <CalendarGridTimeHeader />}
        <ScrollArea
          className="h-fit"
          data-item-type={DataItemTypeAttributes.CalendarGridScrollArea}
        >
          <ScrollBar className="z-[1]" />
          {isClient ? (
            <>
              <div
                className="relative z-0 flex  w-full"
                style={{
                  maxHeight: "calc(80vh - 120px)",
                }}
              >
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
    </CalendarGridPopupProvider>
  );
}
