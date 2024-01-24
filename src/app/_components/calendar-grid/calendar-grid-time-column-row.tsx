// Render out a single (in the time column)
export function CalendarGridTimeColumnRow({
  cellHeightPx,
  rowIndex,
  timeString,
}: {
  cellHeightPx: number;
  rowIndex: number;
  timeString: string;
}) {
  return (
    <div
      id={rowIndex.toString()}
      className={`${"bg-blue-700"}`}
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
