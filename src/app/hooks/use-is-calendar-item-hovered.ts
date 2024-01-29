// This hook is used to determine whether or not an item on the calendar grid is hovered
// This is useful because we sometimes have multiple dom elements that coorespond to the same item (which are not child elements of each other)

import { useContext } from "react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";

export function useIsCalendarGridItemHovered(elementId: string) {
  const calendarGridContext = useContext(CalendarGridContext);

  // TODO: This context update might be causing many other components to re-render, which is not ideal
  // Update the context hovered calendar item id
  function setHovered(hovered: boolean) {
    calendarGridContext.setHoveredCalendarItemId(hovered ? elementId : null);
  }

  return {
    isHovered: calendarGridContext.hoveredCalendarItemId === elementId,
    setHovered,
  };
}
