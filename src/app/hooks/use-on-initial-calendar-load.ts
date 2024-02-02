import { useEffect, useState } from "react";
import { useCalendarGrid } from "./use-calendar-grid";

// Hook which runs some client-side code when the calendar grid loads on the client, such as automatically scrolling to the current time
export function useOnInitialCalendarLoad() {
  const calendarGridContext = useCalendarGrid();

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
