"use client";
import { useContext, useEffect, useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { CalendarGridContext } from "./calendar-grid-context";


export function CalendarGridTopicSession({ topicSession }: { topicSession: RouterOutputs['topicSession']['getTopicSessionsInDateRange'][0] }) {

    const { cellHeightPx, zoomLevel } = useContext(CalendarGridContext);

    // This many pixels represents a single hour in the calendar grid
    const pixelToHourRatio = cellHeightPx * zoomLevel;

    const date = new Date(topicSession.Session_Start);
    const milliseconds = (date.getHours() * 60 * 60 * 1000) + (date.getMinutes() * 60 * 1000) + (date.getSeconds() * 1000) + date.getMilliseconds();
    // This calculates the position of the event in the day as a value (0-24)
    // This is then used to calculate the absolute position of the event in the day
    const hourSessionOccurred = milliseconds / (1000 * 60 * 60);

    const sessionDurationMS = (topicSession.Session_End ? topicSession.Session_End : Date.now()) - topicSession.Session_Start;

    // The height of this session should be relative to the duration of the session

    console.log(sessionDurationMS, "session duration ms", topicSession)
    const sessionCellHeight = (sessionDurationMS / (1000 * 60 * 60 )) ;
    console.log(sessionCellHeight, "session cell height", topicSession)

    return <div className="absolute bg-yellow-500 w-fit p-1 rounded-lg" style={{
        height: `${sessionCellHeight}px`,
        transform: `translateY(${cellHeightPx * (hourSessionOccurred * zoomLevel)}px)`
    }}>{topicSession.Topic_Title}</div>

}