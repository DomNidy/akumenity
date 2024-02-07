"use client";

import { useEffect, useRef } from "react";
import { CalendarGridTopicSession } from "../topic-session/calendar-grid-topic-session";
import { useCalendarGridColumn } from "~/app/_components/calendar-grid/hooks/use-calendar-grid-column";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import { CalendarGridColumnCurrTimeHoverRenderer } from "./calendar-grid-column-curr-time-hover-renderer";
import { useTimeFromPosition } from "~/app/_components/calendar-grid/hooks/use-time-from-position";

export function CalendarGridColumn({ day }: { day: Date }) {
  const calendarGridContext = useCalendarGrid();

  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  // Get the topic session slices for this column
  const { columnTopicSessionSlices } = useCalendarGridColumn({
    day,
  });

  // Hook which can be used to calculate the time from a click position on the calendar grid
  const { clickPos, onClickedCalendarGridColumn } = useTimeFromPosition({
    gridColumnDomRef,
    columnDay: day,
  });

  useEffect(() => {
    console.log(
      JSON.stringify(clickPos),
      new Date(clickPos?.calendarTimeMS ?? 0),
    );
  }, [clickPos]);

  return (
    <div
      onClick={(e) => onClickedCalendarGridColumn(e)}
      className={`relative flex flex-row border-[1px] bg-[#0D0D0D]`}
      ref={gridColumnDomRef}
      style={{
        height: `${
          24 * calendarGridContext.zoomLevel * calendarGridContext.cellHeightPx
        }px`,
      }}
    >
      {/** Map out cells */}
      {/** To position the topic sessions, we'll need to subtract the height of this flexbox (and the one that they are mapped into) from their computed positions */}
      {columnTopicSessionSlices?.map((topicSessionSlice) => {
        return (
          <CalendarGridTopicSession
            key={topicSessionSlice.SK.concat(
              topicSessionSlice.sliceEndMS.toString(),
            )}
            topicSessionSlice={topicSessionSlice}
            columnDomRef={gridColumnDomRef}
          />
        );
      })}
      <CalendarGridColumnCurrTimeHoverRenderer />
    </div>
  );
}
