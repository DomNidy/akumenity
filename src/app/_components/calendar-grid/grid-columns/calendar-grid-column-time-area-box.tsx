// Renders out a box where the user clicked, allowing them to create a new topic session at that time

export function CalendarGridColumnTimeAreaBox({
  x,
  y,
  calendarTimeMS,
}: {
  x?: number;
  y?: number;
  calendarTimeMS?: number;
}) {
  // TODO: Implement a form that pops up as a child of this component, allowing the user to create a new topic session at the time they clicked
  return (
    <div
      style={{
        top: y ? y - 24 : 0,
        display: x ? "block" : "none",
      }}
      className={` animate-calendar-grid-time-area-box-open
       absolute h-12 w-full rounded-xl bg-white bg-opacity-15  p-1`}
    >
      {calendarTimeMS ? new Date(calendarTimeMS).toLocaleTimeString() : null}
    </div>
  );
}
