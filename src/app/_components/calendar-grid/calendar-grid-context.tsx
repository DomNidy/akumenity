"use client";
import { createContext, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { getDisplayDateBounds, getPageNumber, getWeeksSinceUnixEpoch, getWeekStartAndEndMS, sliceTopicSession } from "~/lib/utils";
import { useDaySessionMap } from "~/app/hooks/use-day-session-map";
import { type CalendarGridContextType, CalendarGridDisplayMode, DaysOfTheWeek } from "./calendar-grid-definitions";


// The calendar grid and its child components read data from this context (avoiding prop drilling)
export const CalendarGridContext = createContext<CalendarGridContextType>({
    page: getWeeksSinceUnixEpoch(new Date()),
    incrementPage: () => { throw new Error("incrementPage not implemented") },
    decrementPage: () => { throw new Error("decrementPage not implemented") },
    displayMode: CalendarGridDisplayMode.WEEK_DISPLAY,
    displayPreferences: { weekStartsOn: DaysOfTheWeek.Monday },
    setDisplayMode: () => { throw new Error("setDisplayMode not implemented") },
    setWeek: () => { throw new Error("setWeek not implemented") },
    setZoomLevel: () => { throw new Error("setZoomLevel not implemented") },
    setCellHeightPx: () => { throw new Error("setCellHeightPx not implemented") },
    displayDateBounds: getDisplayDateBounds(CalendarGridDisplayMode.WEEK_DISPLAY, new Date()),
    currentWeek: 0,
    zoomLevel: 0,
    topicSessions: [],
    daySessionSliceMap: {},
    cellHeightPx: 60,
})

// This component wraps & provides the context to the calendar grid and its child components
export function CalendarGridProvider({ children }: { children: React.ReactNode }) {
    // The display mode of the calendar grid
    const [displayMode, _setDisplayMode] = useState<CalendarGridDisplayMode>(CalendarGridDisplayMode.WEEK_DISPLAY);

    // The page we are currently on
    const [page, _setPage] = useState<number>(getWeeksSinceUnixEpoch(new Date()));

    // The user's display preferences (read from local storage)
    // TODO: Find hook to use local storage
    const [displayPreferences, _setDisplayPreferences] = useState<CalendarGridContextType['displayPreferences']>({ weekStartsOn: DaysOfTheWeek.Monday });

    // Bounds (date range) of the data being displayed
    const [displayDateBounds, _setDisplayDateBounds] = useState<CalendarGridContextType['displayDateBounds']>(getDisplayDateBounds(CalendarGridDisplayMode.WEEK_DISPLAY, new Date()));

    // The current week of the year
    const [currentWeek, _setCurrentWeek] = useState<number>(getWeeksSinceUnixEpoch(new Date()));

    // Height of a single cell in the calendar grid
    const [cellHeightPx, _setCellHeightPx] = useState(60);

    // The zoom level
    const [zoomLevel, _setZoomLevel] = useState(1);

    const topicSessionsQuery = api.topicSession.getTopicSessionsInDateRange.useQuery({
        // Get the current week number, then multiply it to get a millisecond timestamp for when that week started
        dateRange: {
            startTimeMS: displayDateBounds.beginDate.getTime(),
            endTimeMS: displayDateBounds.endDate.getTime()
        },
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
        decrementPage() {
            // TODO: Implement decrementing page
            console.log("decrementing page")
        },
        incrementPage() {
            // TODO: Implement incrementing page
            console.log("incrementing page")
        },
        page,
        displayPreferences,
        displayMode,
        setDisplayMode: _setDisplayMode,
        displayDateBounds,
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