"use client";

import { useRef } from "react";
import { CalendarGridTopicSession } from "../topic-session/calendar-grid-topic-session";
import { useCalendarGridColumn } from "~/app/_components/calendar-grid/hooks/use-calendar-grid-column";
import { getDaysSinceUnixEpoch } from "~/lib/utils";
import { DataItemTypeAttributes } from "../calendar-grid-definitions";

export function CalendarGridColumn({
  day,
  zoomLevel,
  cellHeightPx,
}: {
  day: Date;
  zoomLevel: number;
  cellHeightPx: number;
}) {
  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  // Get the topic session slices for this column
  const { columnTopicSessionSlices } = useCalendarGridColumn({
    day,
  });

  return (
    <div
      className={`relative flex w-full flex-row border-[1px] bg-[#0D0D0D]`}
      data-item-type={DataItemTypeAttributes.CalendarGridColumn}
      id={`${getDaysSinceUnixEpoch(day)}`}
      ref={gridColumnDomRef}
      style={{
        height: `${24 * zoomLevel * cellHeightPx}px`,
      }}
    >
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
