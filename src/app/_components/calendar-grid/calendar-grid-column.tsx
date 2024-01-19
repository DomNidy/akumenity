// ###### This component is responsible for:
// - Rendering out the columns of the calendar grid. 
// - Rendering out **CalendarGridTopicSession** components for each `TopicSession` received via props.
// - Allowing the user to create a new `TopicSession` by clicking anywhere on any cell.
// - Allowing the user to delete a `TopicSession` by clicking on the **CalendarGridTopicSession** component.
"use client";

import { useContext, useEffect, useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridTopicSession } from "./calendar-grid-topic-session";

export function CalendarGridColumn({ day, topicSessions }: { day: Date, topicSessions: RouterOutputs['topicSession']['getTopicSessionsInDateRange'] }) {
    const calendarGridContext = useContext(CalendarGridContext);

    return <div>
        {/** TODO: Map out each topicsession, calculate the absolute position based on the time that it occured */}
        {/** 23.2 here is the hour at which the event occurred during the day, so it would be around 11pm */}
        {calendarGridContext.daySessionsMap[day.getDay()]?.topicSessions.map((topicSession, index) => {
            return <CalendarGridTopicSession key={index} topicSession={topicSession} />
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