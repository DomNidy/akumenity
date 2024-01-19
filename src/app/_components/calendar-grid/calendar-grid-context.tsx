"use client";
import { type z } from "zod";
import { createContext, useState } from "react";
import { type dbConstants } from "~/definitions/dbConstants";
import { type RouterOutputs, api } from "~/trpc/react";
import { getDateForDayRelativeToCurrentDate, getWeekNumberSinceUnixEpoch, getWeekStartAndEnd, mapSessionsToDays } from "~/lib/utils";

// The type of the data stored in the context
interface CalendarGridContextType {
    // The week (since unit epoch) data is being displayed / fetched for
    currentWeek: number;

    // Used to set the current week
    setWeek: (week: number) => void;

    // Wrapper which controls the zoomLevel state
    setZoomLevel: (zoomLevel: number) => void;
    // This corresponds to the amount of cells needed to display a single hour
    // In other words, it is a cellToHourRatio. For example, if zoomLevel is 2, then 2 cells are needed to display a single hour (48 cells for 24 hours)
    zoomLevel: number;

    // An array of all topic sessions associated with the current week and year
    // Our react query hook will handle the fetching and caching of this data
    topicSessions: RouterOutputs['topicSession']['getTopicSessionsInDateRange'];

    // Map of day of week to sessions on that day
    daySessionsMap: Record<number, { day: Date, topicSessions: RouterOutputs['topicSession']['getTopicSessionsInDateRange'] }>;

    // The height (in pixels) of a single cell
    // This is important because it is used to calculate the height of the calendar grid and align the time column
    cellHeightPx: number;
    // Update the cell height
    setCellHeightPx: (cellHeightPx: number) => void;
}

// The calendar grid and its child components read data from this context (avoiding prop drilling)
export const CalendarGridContext = createContext<CalendarGridContextType>({
    setWeek: () => { throw new Error("setWeek not implemented") },
    setZoomLevel: () => { throw new Error("setZoomLevel not implemented") },
    setCellHeightPx: () => { throw new Error("setCellHeightPx not implemented") },
    currentWeek: 0,
    zoomLevel: 0,
    topicSessions: [],
    daySessionsMap: {},
    cellHeightPx: 40,
})

// This component is used to wrap the calendar grid and its child components
// It provides the context to the calendar grid and its child components
export function CalendarGridProvider({ children }: { children: React.ReactNode }) {
    // The current week of the year
    const [currentWeek, _setCurrentWeek] = useState<number>(getWeekNumberSinceUnixEpoch(new Date()));

    // Height of a single cell in the calendar grid
    const [cellHeightPx, _setCellHeightPx] = useState(40);

    // The zoom level
    const [zoomLevel, _setZoomLevel] = useState(1);
    const topicSessionsQuery = api.topicSession.getTopicSessionsInDateRange.useQuery({
        // Get the current week number, then multiply it to get a millisecond timestamp for when that week started
        dateRange: getWeekStartAndEnd(new Date(currentWeek * 7 * 24 * 60 * 60 * 1000)),
    })


    // The context value
    const value: CalendarGridContextType = {
        currentWeek,
        setWeek: _setCurrentWeek,
        zoomLevel,
        // Ensure zoom level is always at least 1
        setZoomLevel: (lvl: number) => _setZoomLevel(lvl <= 0 ? 1 : lvl >= 12 ? 11 : lvl),
        topicSessions: topicSessionsQuery.data ?? [],
        daySessionsMap: mapSessionsToDays(topicSessionsQuery.data ?? [], currentWeek),
        cellHeightPx: 45,
        setCellHeightPx: _setCellHeightPx,
    }


    // This component provides the context to its child components
    return (
        <CalendarGridContext.Provider value={value}>
            {children}
        </CalendarGridContext.Provider>
    )
}