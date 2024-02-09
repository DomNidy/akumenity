// Renders out a box where the user clicked, allowing them to create a new topic session at that time

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

export const CalendarGridColumnTimeAreaBox = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        className,
        "absolute h-12 w-full  rounded-xl bg-white bg-opacity-15  p-1",
      )}
    ></div>
  );
});
