"use client";
import { type z } from "zod";
import { createContext, useState } from "react";
import { type dbConstants } from "~/definitions/dbConstants";
import { type RouterOutputs, api } from "~/trpc/react";
import { getDateForDayRelativeToCurrentDate, getWeekNumberSinceUnixEpoch, getWeekStartAndEnd } from "~/lib/utils";

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
}

// The calendar grid and its child components read data from this context (avoiding prop drilling)
export const CalendarGridContext = createContext<CalendarGridContextType>({
    currentWeek: 0,
    setWeek: () => { throw new Error("setWeek not implemented") },
    setZoomLevel: () => { throw new Error("setZoomLevel not implemented") },
    zoomLevel: 0,
    topicSessions: [],
    daySessionsMap: {},
})

// This component is used to wrap the calendar grid and its child components
// It provides the context to the calendar grid and its child components
export function CalendarGridProvider({ children }: { children: React.ReactNode }) {
    // The current week of the year
    const [currentWeek, _setCurrentWeek] = useState<number>(getWeekNumberSinceUnixEpoch(new Date()));

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
        setZoomLevel: (lvl: number) => _setZoomLevel(lvl <= 0 ? 1 : lvl),
        topicSessions: topicSessionsQuery.data ?? [],

        daySessionsMap: (topicSessionsQuery.data?.reduce((acc, session) => {
            const dayOfWeek = new Date(session.Session_Start).getDay();

            const map: Record<number, { day: Date, topicSessions: RouterOutputs['topicSession']['getTopicSessionsInDateRange'] }> = {
                ...acc,
                [dayOfWeek]: { day: new Date(new Date(session.Session_Start).setHours(0, 0, 0, 0)), topicSessions: [session, ...(acc[dayOfWeek]?.topicSessions ?? [])] }
            }

            return map;
        }, Array.from({ length: 7 }, (val, index) => ({
            day:
                // TODO: Refactor this and the above code to be more readable
                // This is really confusing, but basically we want to get the date for a day N days away from the current date
                // The index ranges from 0 to 6, since we are mapping over an array of length 7
                // We then calculate the difference between the currentWeek the calendar is displaying data for, and the current week (in real time)
                // We then multiply that difference by 7, since there are 7 days in a week
                // Then we subtract that difference from the index
                // * currentWeek is the week the calendar is displaying data for, not the actual current week (in real time) 
                new Date(getDateForDayRelativeToCurrentDate(index - (
                    7 * (
                        getWeekNumberSinceUnixEpoch(new Date()) - currentWeek
                    )
                )).setHours(0, 0, 0, 0)),
            topicSessions: []
        })) as Record<number, { day: Date, topicSessions: RouterOutputs['topicSession']['getTopicSessionsInDateRange'] }>) ?? {}),
    }


    // This component provides the context to its child components
    return (
        <CalendarGridContext.Provider value={value}>
            {children}
        </CalendarGridContext.Provider>
    )
}