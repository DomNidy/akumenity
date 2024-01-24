"use client";
import { useState } from "react";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { useCalculateTopicSessionPlacement } from "~/app/hooks/use-calculate-topic-session-placement";

export function CalendarGridTopicSession({
  topicSessionSlice,
  columnDomRef,
}: {
  topicSessionSlice: TopicSessionSlice;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState(false);

  const topicSessionPlacement = useCalculateTopicSessionPlacement({
    topicSessionSlice,
    columnDomRef,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          onClick={() => setOpen(!open)}
          className={`${getLabelColor(
            topicSessionSlice.ColorCode,
          )} absolute flex cursor-pointer  flex-col overflow-hidden rounded-lg hover:border-2`}
          style={{
            height: `${topicSessionPlacement.topicSessionHeight}px`,
            width: `${topicSessionPlacement.topicSessionWidth}px`,
            top: `${topicSessionPlacement.topicSessionTopOffset}px`,
            // TODO: Use the left,right,width properties to position elements that are overlapping
            // left: `${}px`,
          }}
        >
          <p>{topicSessionSlice.Topic_Title}</p>
          <p>{topicSessionSlice.SK}</p>
          <p>
            {new Date(topicSessionSlice.Session_Start).toLocaleTimeString(
              "en-us",
              {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              },
            )}{" "}
            -{" "}
            {new Date(
              topicSessionSlice.Session_End
                ? topicSessionSlice.Session_End
                : new Date(),
            ).toLocaleTimeString("en-us", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <p>{topicSessionSlice.Topic_Title}</p>
        <p>{topicSessionSlice.SK}</p>
        <p>
          {new Date(topicSessionSlice.Session_Start).toLocaleTimeString(
            "en-us",
            {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            },
          )}{" "}
          -{" "}
          {new Date(
            topicSessionSlice.Session_End
              ? topicSessionSlice.Session_End
              : new Date(),
          ).toLocaleTimeString("en-us", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
        <p>
          Slice start: {topicSessionSlice.sliceStartMS} (
          {new Date(topicSessionSlice.sliceStartMS).toLocaleTimeString(
            "en-us",
            {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            },
          )}
          )
        </p>
        <p>
          Slice end: {topicSessionSlice.sliceEndMS} (
          {new Date(topicSessionSlice.sliceEndMS).toLocaleTimeString("en-us", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
          )
        </p>
      </PopoverContent>
    </Popover>
  );
}
