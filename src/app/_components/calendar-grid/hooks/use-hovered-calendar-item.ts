import { useContext } from "react";
import { HoveredCalendarItemContext } from "../calendar-grid-hovered-topic-session-context";

export const useHoveredCalendarItem = () => {
  return useContext(HoveredCalendarItemContext);
};
