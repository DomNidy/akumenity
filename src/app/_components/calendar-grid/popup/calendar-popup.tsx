// import { X } from "lucide-react";
import { CalendarPopupForm } from "./calendar-popup-form";
import { DataItemTypeAttributes } from "../calendar-grid-definitions";
import { useCalendarPopup } from "../hooks/use-calendar-popup";
import { autoUpdate, useFloating, autoPlacement } from "@floating-ui/react";

export function CalendarPopup() {
  const { timeAreaBoxDomRef } = useCalendarPopup();

  // Using floating ui to tether the popup to the time area box
  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: timeAreaBoxDomRef?.current,
    },
    middleware: [autoPlacement()],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div
      ref={refs.setFloating}
      onClick={(e) => e.stopPropagation()}
      data-item-type={DataItemTypeAttributes.CalendarPopup}
      className=" z-[4] w-max animate-calendar-grid-time-area-box-open rounded-md border bg-popover p-4 text-popover-foreground shadow-md  outline-none"
      style={{
        ...floatingStyles,
      }}
    >
      <CalendarPopupForm />
    </div>
  );
}
