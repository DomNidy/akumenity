"use client";

import { useEffect, useRef } from "react";
import { CalendarGridTopicSession } from "./calendar-grid-topic-session";
import { useCalendarGridColumn } from "~/app/hooks/use-calendar-grid-column";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";

export function CalendarGridColumn({ day }: { day: Date }) {
  const calendarGridContext = useCalendarGrid();

  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  const { columnTopicSessionSlices } = useCalendarGridColumn({
    day,
  });

  useEffect(() => {
    console.log("columnTopicSessionSlices", columnTopicSessionSlices);
  }, [columnTopicSessionSlices]);

  return (
    <div
      className={`relative flex flex-row border-[1px] bg-red-300`}
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
    </div>
  );
}
