import { useContext } from "react";
import { CalendarGridPopupContext } from "../popup/calendar-popup-context";

// Hook which provides the state and actions for the calendar popup
export function useCalendarPopup() {
  const context = useContext(CalendarGridPopupContext);

  // If the context is undefined, throw an error (this happens when a provider is not found up the tree)
  if (!context) {
    throw new Error(
      "useCalendarPopup must be used within a CalendarGridPopupProvider",
    );
  }

  return context;
}
