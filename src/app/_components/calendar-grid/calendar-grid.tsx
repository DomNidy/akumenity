"use client";
import { useContext, useEffect, useRef } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { Button } from "../ui/button";
import { Calendar, ZoomIn, ZoomOut } from "lucide-react";
import { getWeekStartAndEnd } from "~/lib/utils";
import { CalendarGridColumn } from "./calendar-grid-column";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";

export function CalendarGrid() {
    const calendarGridContext = useContext(CalendarGridContext);

    const calendarGridDomRef = useRef<HTMLDivElement>(null);

    // Watch for changes in the calendar grid's height
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (calendarGridDomRef.current) {
                console.log('setting cell height', calendarGridDomRef.current.clientHeight / (24 * calendarGridContext.zoomLevel));
                calendarGridContext.setCellHeightPx(calendarGridDomRef.current.clientHeight / (24 * calendarGridContext.zoomLevel))
            }
        })

        if (calendarGridDomRef.current) {
            resizeObserver.observe(calendarGridDomRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        }
    })


    return <div className="bg-blue-500 rounded-lg sm:px-2 px-8  w-full s mt-2" ref={calendarGridDomRef}>
        <p>Current week: {calendarGridContext.currentWeek}</p>
        <p>Start of week: {new Date(getWeekStartAndEnd(new Date(calendarGridContext.currentWeek * 7 * 24 * 60 * 60 * 1000)).startTimeMS).toDateString()}</p>
        <p>End of week: {new Date(getWeekStartAndEnd(new Date(calendarGridContext.currentWeek * 7 * 24 * 60 * 60 * 1000)).endTimeMS).toDateString()}</p>
        <div className="flex flex-row justify-between">
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.setWeek(calendarGridContext.currentWeek - 1)
            }}>Prev</Button>
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.setWeek(calendarGridContext.currentWeek + 1)
            }}>Next</Button>
        </div>

        <p>Zoom level: {calendarGridContext.zoomLevel}</p>
        <div className="flex flex-row justify-between">
            <Button className="aspect-square p-0" disabled={calendarGridContext.zoomLevel <= 1} onClick={() => {
                calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel - 1)
            }}><ZoomOut /></Button>
            <Button className="aspect-square p-0" disabled={calendarGridContext.zoomLevel >= 11} onClick={() => {
                calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel + 1)
            }}><ZoomIn /></Button>
        </div>

        <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
        <div className="flex w-full ">


            <CalendarGridTimeColumn />

            {[...Array(7).keys()].map((value, index) => {
                // TODO: Implement extra error handling here, even though the daySessionsMap is guaranteed to have a value for each index
                const daySession = calendarGridContext.daySessionsMap[index];
                if (daySession?.day) {
                    return <div key={index} className="flex-grow">
                        <CalendarGridColumn day={daySession.day} topicSessions={daySession.topicSessions} />
                    </div>
                }
            })}

        </div>
    </div>

}