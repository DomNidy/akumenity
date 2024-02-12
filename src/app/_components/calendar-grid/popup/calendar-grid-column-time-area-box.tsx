// Renders out a box where the user clicked, allowing them to create a new topic session at that time

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";
import { DataItemTypeAttributes } from "../calendar-grid-definitions";

export const CalendarGridColumnTimeAreaBox = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      data-item-type={DataItemTypeAttributes.CalendarGridColumnTimeAreaBox}
      ref={ref}
      className={cn(
        className,
        "absolute h-12 w-full  rounded-xl bg-white bg-opacity-15  p-1",
      )}
      {...props}
    ></div>
  );
});
