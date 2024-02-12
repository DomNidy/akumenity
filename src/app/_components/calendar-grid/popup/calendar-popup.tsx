// import { X } from "lucide-react";
import { type PopupData } from "./calendar-popup-definitions";
import { CalendarPopupForm } from "./calendar-popup-form";
import { DataItemTypeAttributes } from "../calendar-grid-definitions";
import { forwardRef, useMemo } from "react";

// TODO: Implement time area box rendering on the grid column
// TODO: Add close button
// TODO: Fix issue with the clickTime not changing when we click on the same grid column that the popup is already open on
export const CalendarPopup = forwardRef<HTMLDivElement, PopupData>(
  (props, ref) => {
    // Calculate position to ensure sure the popup is not rendered off the screen
    const position = useMemo(() => {
      // TODO: We should read the element size from a ref instead of using 400
      const x = Math.min(props.clientX, window.innerWidth - 400);
      const y = Math.min(props.clientY, window.innerHeight - 450);
      return { x, y };
    }, [props.clientX, props.clientY]);

    return (
      <>
        {/* <CalendarGridColumnTimeAreaBox
          className={`absolute  z-[50]`}
          style={{
            top: `${props.clientY}px`,
          }}
        /> */}
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          data-item-type={DataItemTypeAttributes.CalendarPopup}
          className="fixed z-[3]  animate-calendar-grid-time-area-box-open rounded-md border bg-popover p-4 text-popover-foreground shadow-md  outline-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <CalendarPopupForm clickTime={props.clickTime} />
        </div>
      </>
    );
  },
);
