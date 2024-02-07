import { useContext } from "react";
import { CalendarGridContext } from "../calendar-grid-context";

// Hook for useCalendarGrid()
export function useCalendarGrid() {
  const context = useContext(CalendarGridContext);

  // If the context is undefined, throw an error (this happens when a provider is not found up the tree)
  if (!context) {
    throw new Error(
      "useCalendarGrid must be used within a CalendarGridProvider",
    );
  }

  return context;
}
