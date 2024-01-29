import { useContext } from "react";
import { HoveredCalendarItemContext } from "../_components/calendar-grid/calendar-grid-hovered-topic-session-context";

export const useHoveredCalendarItem = () => {
  return useContext(HoveredCalendarItemContext);
};
