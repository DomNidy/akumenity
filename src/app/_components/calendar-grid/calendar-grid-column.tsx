// ###### This component is responsible for:
// - Rendering out the columns of the calendar grid. 
// - Rendering out **CalendarGridTopicSession** components for each `TopicSession` received via props.
// - Allowing the user to create a new `TopicSession` by clicking anywhere on any cell.
// - Allowing the user to delete a `TopicSession` by clicking on the **CalendarGridTopicSession** component.
"use client";

import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridTopicSession } from "./calendar-grid-topic-session";
import { getDaysSinceUnixEpoch } from "~/lib/utils";

export function CalendarGridColumn({ day }: { day: Date }) {
    const calendarGridContext = useContext(CalendarGridContext);

    return <div>
        <p className="bg-blue-800">{day.toDateString()} {getDaysSinceUnixEpoch(day)}</p>
        {/** TODO: Map out each topicsession, calculate the absolute position based on the time that it occured */}
        {/** TODO: Figure out why the week is now starting on a wednesday */}
        {/** 23.2 here is the hour at which the event occurred during the day, so it would be around 11pm */}
        {calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]?.topicSessionSlices.map((topicSessionSlice, index) => {
            return <CalendarGridTopicSession key={index} topicSessionSlice={topicSessionSlice} />
        })}

        {/** TODO: Apply whitespace-nowrap without breaking the display of the calendar */}
        <div className="grid grid-cols-1 bg-red-300 ">
            {[...Array(24 * calendarGridContext.zoomLevel).keys()].map((value, index) => {

                return <div key={index} className={``} style={{
                    height: `${calendarGridContext.cellHeightPx}px`,
                    maxHeight: `${calendarGridContext.cellHeightPx}px`,
                    minHeight: `${calendarGridContext.cellHeightPx}px`
                }}>{index / calendarGridContext.zoomLevel}</div>
            })}
        </div>

    </div >
}