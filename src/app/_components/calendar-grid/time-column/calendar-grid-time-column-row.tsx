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
>(({ ...props }, ref) => (
  <div
    ref={ref}
    id={props.rowIndex.toString()}
    {...props}
    className={cn("w-full bg-blue-800", props.className)}
    style={{
      height: `${props.cellHeightPx}px`,
      maxHeight: `${props.cellHeightPx}px`,
      minHeight: `${props.cellHeightPx}px`,
    }}
  >
    <p className="cursor-default">{props.timeString}</p>{" "}
  </div>
));
