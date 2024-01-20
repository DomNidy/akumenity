"use client";
import { createContext, useEffect, useState } from "react";
import { type RouterOutputs, api } from "~/trpc/react";
import { getWeekNumberSinceUnixEpoch, getWeekStartAndEndMS, sliceTopicSession } from "~/lib/utils";
import { useDaySessionMap } from "~/app/hooks/use-day-session-map";

// We break down topic sessions into slices so that we can display sessions that span multiple days
// This object is the same as a topic session, but with two new properties, sliceStartMS and sliceEndMS (which indicate the start and end of the slice in ms)
export type TopicSessionSlice = RouterOutputs['topicSession']['getTopicSessionsInDateRange'][0] & { sliceStartMS: number, sliceEndMS: number };

// The type of the data stored in the context
export interface CalendarGridContextType {
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

    // Map of day of week to session slices within that day
    daySessionSliceMap: Record<number, { day: Date, topicSessionSlices: TopicSessionSlice[] }>;

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
    daySessionSliceMap: {},
    cellHeightPx: 60,
})

// This component wraps & provides the context to the calendar grid and its child components
export function CalendarGridProvider({ children }: { children: React.ReactNode }) {
    // The current week of the year
    const [currentWeek, _setCurrentWeek] = useState<number>(getWeekNumberSinceUnixEpoch(new Date()));

    // Height of a single cell in the calendar grid
    const [cellHeightPx, _setCellHeightPx] = useState(60);

    // The zoom level
    const [zoomLevel, _setZoomLevel] = useState(1);

    const topicSessionsQuery = api.topicSession.getTopicSessionsInDateRange.useQuery({
        // Get the current week number, then multiply it to get a millisecond timestamp for when that week started
        dateRange: getWeekStartAndEndMS(new Date(currentWeek * 7 * 24 * 60 * 60 * 1000)),
    })

    // Custom hook which manages the daySessionMap & its state
    const daySessionMap = useDaySessionMap();

    // Slice the topic sessions, and then add them to the daySessionMap when query data changes
    useEffect(() => {
        topicSessionsQuery.data?.forEach((topicSession) => {
            // If the session has already been processed, skip it
            if (daySessionMap.isSessionIdProcessed(topicSession.SK)) return
            sliceTopicSession(topicSession).forEach((topicSessionSlice) => {
                daySessionMap.addSessionSliceToMap(topicSessionSlice);
            })
            daySessionMap.markSessionIdAsProcessed(topicSession.SK)
        })
    }, [topicSessionsQuery.data, currentWeek])

    // The context made available to child components
    const value: CalendarGridContextType = {
        currentWeek,
        setWeek: _setCurrentWeek,
        zoomLevel,
        // Ensure zoom level is always at least 1
        setZoomLevel: (lvl: number) => _setZoomLevel(lvl <= 0 ? 1 : lvl >= 12 ? 11 : lvl),
        topicSessions: topicSessionsQuery.data ?? [],
        daySessionSliceMap: daySessionMap.daySessionMap,
        cellHeightPx: cellHeightPx,
        setCellHeightPx: _setCellHeightPx,
    }

    // This component provides the context to its child components
    return (
        <CalendarGridContext.Provider value={value}>
            {children}
        </CalendarGridContext.Provider>
    )
}