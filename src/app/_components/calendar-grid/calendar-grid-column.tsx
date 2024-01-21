// ###### This component is responsible for:
// - Rendering out the columns of the calendar grid. 
// - Rendering out **CalendarGridTopicSession** components for each `TopicSession` received via props.
// - Allowing the user to create a new `TopicSession` by clicking anywhere on any cell.
// - Allowing the user to delete a `TopicSession` by clicking on the **CalendarGridTopicSession** component.
"use client";

import { useContext, useRef } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridTopicSession } from "./calendar-grid-topic-session";
import { getDaysSinceUnixEpoch } from "~/lib/utils";

export function CalendarGridColumn({ day }: { day: Date }) {
    const calendarGridContext = useContext(CalendarGridContext);

    // ref to the gridcolumn so we can get its height
    const gridColumnDomRef = useRef<HTMLDivElement>(null);

    return <div className={`flex flex-col relative bg-red-300 `} ref={gridColumnDomRef} style={{ height: `${24 * calendarGridContext.zoomLevel * calendarGridContext.cellHeightPx}px` }}>
        <p className="z-50 bg-blue-800 w-full">{day.toDateString()}</p>
        {/** Map out cells */}
        {/** To position the topic sessions, we'll need to subtract the height of this flexbox (and the one that they are mapped into) from their computed positions */}
        {calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]?.topicSessionSlices.map((topicSessionSlice) => {
            return <CalendarGridTopicSession key={topicSessionSlice.SK.concat(topicSessionSlice.sliceEndMS.toString())} topicSessionSlice={topicSessionSlice} columnDomRef={gridColumnDomRef} />
        })}
    </div >
}