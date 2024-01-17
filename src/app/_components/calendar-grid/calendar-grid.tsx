"use client";
import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { getWeekStartAndEnd } from "~/lib/utils";

export function CalendarGrid() {
    const calendarGridContext = useContext(CalendarGridContext);



    return <div className="bg-blue-500 rounded-lg sm:px-2 px-8  w-full sm:w-auto mt-2">
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
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel + 1)
            }}><ZoomIn /></Button>
        </div>

        <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
        {[...Array(7).keys()].map((value, index) => {
            const daySession = calendarGridContext.daySessionsMap[index];
            if (daySession?.day) {
                return <div key={index}>
                    <p>{daySession.day.toDateString()}: {daySession.topicSessions.length ?? 0}</p>
                </div>
            } else {
                return <div key={index}>
                    <p>No sessions for this day</p>
                </div>
            }
        })}
    </div>

}