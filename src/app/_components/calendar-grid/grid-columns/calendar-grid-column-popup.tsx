import { type RefObject } from "react";
import { CalendarGridColumnTimeAreaBox } from "./calendar-grid-column-time-area-box";
import { usePopup } from "../hooks/use-popup";
import { Popover, PopoverContent } from "../../ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";

interface CalendarGridColumnPopupMenuProps {
  gridColumnDomRef: RefObject<HTMLDivElement>;
  columnDay: Date;
}

export default function CalendarGridColumnPopupMenu({
  ...props
}: CalendarGridColumnPopupMenuProps) {
  const { gridColumnDomRef, columnDay } = props;

  const { clickPos, isPopupActive } = usePopup({
    popupID: "id" + columnDay.getTime().toString(),
    columnDay,
    gridColumnDomRef,
  });

  if (!isPopupActive) return null;

  return (
    <Popover open={isPopupActive}>
      {/** Anchor the popover content to click position */}
      <PopoverAnchor
        style={{
          position: "absolute",
          width: "100%",
          top: `${clickPos?.y ? clickPos.y - 20 : 0}px `,
        }}
      >
        <CalendarGridColumnTimeAreaBox />
      </PopoverAnchor>
      <PopoverContent
        avoidCollisions={true}
        hideWhenDetached={false}
        id={"id" + columnDay.getTime().toString()}
      >
        {/** TODO: Render a form here which allows users to create topic sessions at this time  */}
        <div className=" p-4">{columnDay.toDateString()}</div>
      </PopoverContent>
    </Popover>
  );
}
