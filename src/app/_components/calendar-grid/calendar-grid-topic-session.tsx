"use client";
import { useContext, useRef, useState } from "react";
import { CalendarGridContext, type TopicSessionSlice } from "./calendar-grid-context";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";


export function CalendarGridTopicSession({ topicSessionSlice, columnDomRef }: { topicSessionSlice: TopicSessionSlice, columnDomRef: React.RefObject<HTMLDivElement>}) {
    const topicSessionDomRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const { cellHeightPx, zoomLevel } = useContext(CalendarGridContext);

    // Time at which the session was started
    const date = new Date(topicSessionSlice.sliceStartMS);
    // Calculate the number of milliseconds that have passed since the start of the day
    const milliseconds = (date.getHours() * 60 * 60 * 1000) + (date.getMinutes() * 60 * 1000) + (date.getSeconds() * 1000) + date.getMilliseconds();
    // This calculates the position of the event in the day as a value (0-24)
    // This is then used to calculate the absolute position of the event in the day
    const hourSessionOccurred = milliseconds / (1000 * 60 * 60);
    // Calculate the duration of the session in milliseconds
    // Calculate the height of this session, it should be relative to the duration of the session
    // TODO: Uncomment the math.max call, that is what calculates the appropriate height for the session
    const sessionCellHeightPx = 15 //Math.max(5, (sessionDurationMS / (1000 * 60 * 60)) * cellHeightPx * zoomLevel);

    // * columnHeight is the height of the column this session is rendered over, in pixels
    const columnHeight = columnDomRef.current?.clientHeight ?? cellHeightPx * zoomLevel * 24;
    // * hourInPixels is the amount of pixels in height that represent a single hour (based on the current dimensions & zoom lvl)
    const hourInPixels = zoomLevel * cellHeightPx;
    // * relativePosition is a ratio between 0 and 1 which represents how far down the column the session should be positioned
    const relativePosition = hourInPixels * hourSessionOccurred / (columnHeight);


    console.log("Relative position", relativePosition)


    return <Popover>
        <PopoverTrigger asChild>
            <div
                ref={topicSessionDomRef}
                onClick={() => setOpen(!open)}
                className={`relative flex flex-col ${getLabelColor(topicSessionSlice.ColorCode)} cursor-pointer  overflow-hidden hover:border-2 rounded-lg`} style={{
                    height: `${sessionCellHeightPx}px`,
                    width: `${columnDomRef.current?.clientWidth ?? 100}px`,
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
        </PopoverTrigger>

        <PopoverContent className="w-80">
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
            <p>Slice start: {topicSessionSlice.sliceStartMS} ({new Date(topicSessionSlice.sliceStartMS).toLocaleTimeString("en-us", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            })})</p>
            <p>Slice end: {topicSessionSlice.sliceEndMS} ({new Date(topicSessionSlice.sliceEndMS).toLocaleTimeString("en-us", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            })})</p>

        </PopoverContent>

    </Popover>




}