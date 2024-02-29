import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

interface CalendarGridTimeColumnRowProps
  extends HTMLAttributes<HTMLDivElement> {
  cellHeightPx: number;
  rowIndex: number;
  timeString: string;
}

export const CalendarGridTimeColumnRow = forwardRef<
  HTMLDivElement,
  CalendarGridTimeColumnRowProps
>(({ cellHeightPx, rowIndex, timeString, ...props }, ref) => (
  <div
    ref={ref}
    id={rowIndex.toString()}
    className={cn("bg-blue-800 ", props.className)}
    style={{
      height: `${cellHeightPx}px`,
      maxHeight: `${cellHeightPx}px`,
      minHeight: `${cellHeightPx}px`,
    }}
    {...props}
  >
    <p className="cursor-default tracking-tightest ">{timeString}</p>{" "}
  </div>
));
