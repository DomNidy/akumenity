import { useIsCurrentTimeColumnRow } from "~/app/hooks/use-is-current-time-column-row";

// Render out a single (in the time column)
export function CalendarGridTimeColumnRow({
  cellHeightPx,
  rowIndex,
  timeString,
  currentTimeElementRef,
}: {
  cellHeightPx: number;
  rowIndex: number;
  timeString: string;
  currentTimeElementRef: React.RefObject<HTMLDivElement> | null;
}) {
  const isCurrentTimeColumnRow = useIsCurrentTimeColumnRow(rowIndex);
  return (
    <div
      id={rowIndex.toString()}
      // If this elements index corresponds to the current time, set it as the currentTimeElementRef
      ref={isCurrentTimeColumnRow ? currentTimeElementRef : null}
      className={`${
        isCurrentTimeColumnRow ? "bg-red-700 font-bold" : "bg-blue-700"
      }`}
      style={{
        height: `${cellHeightPx}px`,
        maxHeight: `${cellHeightPx}px`,
        minHeight: `${cellHeightPx}px`,
      }}
    >
      {timeString}
    </div>
  );
}
