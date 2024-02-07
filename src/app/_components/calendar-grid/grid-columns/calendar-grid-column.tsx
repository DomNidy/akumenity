"use client";

import { useRef } from "react";
import { CalendarGridTopicSession } from "../topic-session/calendar-grid-topic-session";
import { useCalendarGridColumn } from "~/app/_components/calendar-grid/hooks/use-calendar-grid-column";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import { useTimeFromPosition } from "~/app/_components/calendar-grid/hooks/use-time-from-position";
import { CalendarGridColumnTimeAreaBox } from "./calendar-grid-column-time-area-box";

export function CalendarGridColumn({ day }: { day: Date }) {
  const { zoomLevel, cellHeightPx } = useCalendarGrid();

  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  // Get the topic session slices for this column
  const { columnTopicSessionSlices } = useCalendarGridColumn({
    day,
  });

  // Used to get the time from a position of a click
  // Maybe we can abstract all of this logic into a new component, instead of using the
  // This hook attatches event listeners to the dom element passed in by ref, and returns the time of the click
  const { clickPos, cursorInColumn } = useTimeFromPosition({
    gridColumnDomRef,
    columnDay: day,
  });

  return (
    <div
      className={`relative flex flex-row border-[1px] bg-[#0D0D0D]`}
      ref={gridColumnDomRef}
      style={{
        height: `${24 * zoomLevel * cellHeightPx}px`,
      }}
    >
      {/** Renders a box where the user clicked, along with the relative time (based on its positioning) */}
      {cursorInColumn && <CalendarGridColumnTimeAreaBox {...clickPos} />}

      {/** Map out topic sessions for this column */}
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
    </div>
  );
}
