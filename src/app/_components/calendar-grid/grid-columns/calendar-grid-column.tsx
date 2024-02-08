"use client";

import { useRef } from "react";
import { CalendarGridTopicSession } from "../topic-session/calendar-grid-topic-session";
import { useCalendarGridColumn } from "~/app/_components/calendar-grid/hooks/use-calendar-grid-column";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import CalendarGridColumnPopupMenu from "./calendar-grid-column-popup";

export function CalendarGridColumn({ day }: { day: Date }) {
  const { zoomLevel, cellHeightPx } = useCalendarGrid();

  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  // Get the topic session slices for this column
  const { columnTopicSessionSlices } = useCalendarGridColumn({
    day,
  });

  return (
    <div
      className={`relative flex flex-row border-[1px] bg-[#0D0D0D]`}
      id={"id" + day.getTime().toString()}
      ref={gridColumnDomRef}
      style={{
        height: `${24 * zoomLevel * cellHeightPx}px`,
      }}
    >
      {/** Renders a box where the user clicked, along with the relative time (based on its positioning) */}
      <CalendarGridColumnPopupMenu
        gridColumnDomRef={gridColumnDomRef}
        columnDay={day}
      />

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
