// This content should be rendered inside the calendar grid popup

import { type useTimeFromPosition } from "../hooks/use-time-from-position";

export default function CalendarGridColumnPopupBodyContent({
  clickPos,
}: {
  clickPos: ReturnType<typeof useTimeFromPosition>["clickPos"];
}) {
  return (
    <div className="p-4">
      {new Date(clickPos?.calendarTimeMS ?? 0).toTimeString()}
    </div>
  );
}
