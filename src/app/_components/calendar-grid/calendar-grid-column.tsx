"use client";

import { useContext, useRef } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridTopicSession } from "./calendar-grid-topic-session";
import { getDaysSinceUnixEpoch } from "~/lib/utils";

export function CalendarGridColumn({ day }: { day: Date }) {
  const calendarGridContext = useContext(CalendarGridContext);

  // ref to the gridcolumn so we can get its height
  const gridColumnDomRef = useRef<HTMLDivElement>(null);

  console.log(gridColumnDomRef.current?.clientHeight, gridColumnDomRef);

  return (
    <div
      className={`relative flex flex-col bg-red-300 `}
      ref={gridColumnDomRef}
      style={{
        height: `${
          24 * calendarGridContext.zoomLevel * calendarGridContext.cellHeightPx
        }px`,
      }}
    >
      {/** Map out cells */}
      {/** To position the topic sessions, we'll need to subtract the height of this flexbox (and the one that they are mapped into) from their computed positions */}
      {calendarGridContext.daySessionSliceMap[
        getDaysSinceUnixEpoch(day)
      ]?.topicSessionSlices.map((topicSessionSlice) => {
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
