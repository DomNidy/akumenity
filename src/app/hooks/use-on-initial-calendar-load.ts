import { useContext, useEffect, useState } from "react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";

// Hook which runs some client-side code when the calendar grid loads on the client, such as automatically scrolling to the current time
export function useOnInitialCalendarLoad() {
  const calendarGridContext = useContext(CalendarGridContext);

  // If the calendar grid has loaded on the client, run the client-side code
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    calendarGridContext.currentTimeElementRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [isClient]);

  return {
    isClient,
  };
}
