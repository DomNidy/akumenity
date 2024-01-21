"use client";
import { useContext, useRef } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { getDateFromDaySinceUnixEpoch } from "~/lib/utils";
import { CalendarGridColumn } from "./calendar-grid-column";
import { CalendarGridTimeColumn } from "./calendar-grid-time-column";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function CalendarGrid() {
    const calendarGridContext = useContext(CalendarGridContext);
    const calendarGridDomRef = useRef<HTMLDivElement>(null);

    return <div className="bg-blue-500 rounded-lg sm:px-2 px-8 w-full h-fit mt-2" ref={calendarGridDomRef}>
        <p>Current week: {calendarGridContext.currentWeek}</p>
        <p>Start of week: {calendarGridContext.displayDateBounds.beginDate.toDateString()}</p>
        <p>End of week: {calendarGridContext.displayDateBounds.endDate.toDateString()}</p>
        <div className="flex flex-row justify-between">
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.decrementPage()
            }}>Prev</Button>
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.incrementPage()
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

        <p>Cell height: {calendarGridContext.cellHeightPx}</p>
        <div className="flex flex-row justify-between">
            <Button className="aspect-square p-0" disabled={calendarGridContext.cellHeightPx <= 6} onClick={() => {
                calendarGridContext.setCellHeightPx(calendarGridContext.cellHeightPx - 5)
            }}>-</Button>
            <Button className="aspect-square p-0" onClick={() => {
                calendarGridContext.setCellHeightPx(calendarGridContext.cellHeightPx + 5)
            }}>+</Button>
        </div>

        <Button className="mt-2" onClick={() => {
            calendarGridContext.setCellHeightPx(60)
            calendarGridContext.setZoomLevel(1)
        }}>Reset view</Button>


        <p>Sessions in this week: {calendarGridContext.topicSessions.length}</p>
        <ScrollArea className="h-fit">
            <ScrollBar className="z-[60]" />
            <div className="flex w-full max-h-[900px] ">
                <CalendarGridTimeColumn />
                {[...Array(7).keys()].map((value, index) => {
                    // TODO: Implement extra error handling here, even though the daySessionSliceMap is guaranteed to have a value for each index
                    // The day this column will represent data for (-2 to display the week starting on monday)
                    const columnDay = index + (calendarGridContext.currentWeek * 7) - 2;

                    const day = getDateFromDaySinceUnixEpoch(columnDay);
                    return <div key={index} className="w-full">
                        <CalendarGridColumn day={day} />
                    </div>
                })}
            </div>
        </ScrollArea>
    </div>

}