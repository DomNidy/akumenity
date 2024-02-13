// import { X } from "lucide-react";
import { CalendarPopupForm } from "./calendar-popup-form";
import { DataItemTypeAttributes } from "../calendar-grid-definitions";
import { useMemo } from "react";
import { useCalendarPopup } from "../hooks/use-calendar-popup";

// TODO: Implement time area box rendering on the grid column
// TODO: Add close button
// TODO: Fix issue with the clickTime not changing when we click on the same grid column that the popup is already open on
export function CalendarPopup() {
  const { popupDomRef, currentPopupData } = useCalendarPopup();

  // Calculate position to ensure sure the popup is not rendered off the screen
  const position = useMemo(() => {
    if (!currentPopupData) return { x: 0, y: 0 };
    const x = Math.min(currentPopupData.clientX, window.innerWidth - 400);
    const y = Math.min(currentPopupData.clientY, window.innerHeight - 450);
    return { x, y };
  }, [currentPopupData?.clientX, currentPopupData?.clientY]);

  return (
    <>
      {/* <CalendarGridColumnTimeAreaBox
          className={`absolute  z-[50]`}
          style={{
            top: `${props.clientY}px`,
          }}
        /> */}
      <div
        ref={popupDomRef}
        onClick={(e) => e.stopPropagation()}
        data-item-type={DataItemTypeAttributes.CalendarPopup}
        className="fixed z-[3]  animate-calendar-grid-time-area-box-open rounded-md border bg-popover p-4 text-popover-foreground shadow-md  outline-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <CalendarPopupForm />
      </div>
    </>
  );
}
