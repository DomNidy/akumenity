"use client";
import { useContext, useRef, useState } from "react";
import { CalendarGridContext, type TopicSessionSlice } from "./calendar-grid-context";
import { getLabelColor } from "~/lib/utils";


export function CalendarGridTopicSession({ topicSessionSlice }: { topicSessionSlice: TopicSessionSlice }) {

    const topicSessionDomRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const { cellHeightPx, zoomLevel } = useContext(CalendarGridContext);

    // TODO: Figure out way to implement topicsessionslice


    // Time at which the session was started
    const date = new Date(topicSessionSlice.sliceStartMS);

    // Calculate the number of milliseconds that have passed since the start of the day
    const milliseconds = (date.getHours() * 60 * 60 * 1000) + (date.getMinutes() * 60 * 1000) + (date.getSeconds() * 1000) + date.getMilliseconds();

    // This calculates the position of the event in the day as a value (0-24)
    // This is then used to calculate the absolute position of the event in the day
    const hourSessionOccurred = milliseconds / (1000 * 60 * 60);

    // Calculate the duration of the session in milliseconds
    const sessionDurationMS = (topicSessionSlice.sliceEndMS ? topicSessionSlice.sliceEndMS : Date.now()) - topicSessionSlice.sliceStartMS;

    // Calculate the height of this session, it should be relative to the duration of the session
    // TODO: Uncomment the math.max call, that is what calculates the appropriate height for the session
    const sessionCellHeightPx = 2 // Math.max(5, (sessionDurationMS / (1000 * 60 * 60)) * cellHeightPx * zoomLevel);


    console.log('sessionDuration of', topicSessionSlice.Topic_Title, 'is', sessionDurationMS, 'ms')
    console.log('sessionCellHeight of', topicSessionSlice.Topic_Title, 'is', sessionCellHeightPx, 'cells')

    return <div
    ref={topicSessionDomRef}
        onMouseOver={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        className={`absolute flex flex-col ${getLabelColor(topicSessionSlice.ColorCode)} w-[100px] cursor-pointer z-50  overflow-hidden`} style={{
            // TODO: Fix this height hover effect so that it doesnt end up shrinking down larger sessions
            height: !hovered ? `${sessionCellHeightPx}px` : 'auto',
            transform: `translateY(${cellHeightPx * (hourSessionOccurred * zoomLevel)}px)`
        }}>
        <p>{topicSessionSlice.Topic_Title}</p>
        <p>{topicSessionSlice.SK}</p>
        <p>{new Date(topicSessionSlice.Session_Start).toLocaleTimeString("en-us", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })} - {new Date(topicSessionSlice.Session_End ? topicSessionSlice.Session_End : new Date()).toLocaleTimeString("en-us", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })}</p>
    </div>

}