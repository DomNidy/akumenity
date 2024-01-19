"use client";
import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";

export function CalendarGridTimeColumn() {
    const calendarGridContext = useContext(CalendarGridContext);

    // TODO: The user should be able to have a preference for time format (12 hour vs 24 hour)

    return <div className="grid grid-cols-1 w-fit pr-2 bg-blue-400">
        {/** TODO: This <p> element is what is giving us the proper spacing between grid columns and time column */}
        {[...Array(24 * calendarGridContext.zoomLevel).keys()].map((value, index) => {
            const rowTime = new Date()
            rowTime.setHours(0, (60 / calendarGridContext.zoomLevel) * index, 0);
            const timeString = rowTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return <div key={index} style={{
                height: `${calendarGridContext.cellHeightPx}px`,
                maxHeight: `${calendarGridContext.cellHeightPx}px`,
                minHeight: `${calendarGridContext.cellHeightPx}px`
            }}>{timeString}</div>
        })}
    </div>
}