import { useContext, useState } from "react";
import { useCalculateTopicSessionPlacement } from "~/app/hooks/use-calculate-topic-session-placement";
import { CalendarGridContext } from "./calendar-grid-context";
import { useInterval } from "usehooks-ts";

// This function renders out a bar on the calendar grid, located at the current time
export function CalendarGridCurrentTimeBar({
  calendarGridTimeColumnRef,
}: {
  calendarGridTimeColumnRef: React.RefObject<HTMLDivElement>;
}) {
  const { currentTimeElementRef } = useContext(CalendarGridContext);

  // We use the useState hook to keep track of the current time
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  // Update the current time every 3 seconds
  useInterval(() => {
    setCurrentTime(new Date().getTime());
  }, 3000);

  // We use the useCalculateTopicSessionPlacement hook to calculate the placement of the current time bar
  // We are just giving it a fake topic session slice, and the ref to the time column
  // We might want to extract this hook to be more generic, so that it can be used for other things (such as useCalculatePlacement, and useCalculateTopicSessionPlacement)
  const placement = useCalculateTopicSessionPlacement({
    columnDomRef: calendarGridTimeColumnRef,
    topicSessionSlice: {
      Session_Start: currentTime,
      Session_End: null,
      Topic_Title: "",
      PK: "CurrentTimeBar",
      SK: "CurrentTimeBar",
      ColorCode: "blue",
      Session_Status: "active",
      sliceStartMS: currentTime,
      sliceEndMS: currentTime,
      Topic_ID: "",
    },
  });

  return (
    <div
      ref={currentTimeElementRef}
      className="absolute h-2 w-full bg-blue-500"
      style={{
        height: `${placement.topicSessionHeight}px`,
        width: `100%`,
        top: `${placement.topicSessionTopOffset}px`,
      }}
    />
  );
}
