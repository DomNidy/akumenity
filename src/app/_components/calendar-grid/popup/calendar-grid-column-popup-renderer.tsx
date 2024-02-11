import { type RefObject } from "react";
import { CalendarGridColumnTimeAreaBox } from "../popup/calendar-grid-column-time-area-box";
import { usePopup } from "../hooks/use-popup";
import { Popover, PopoverContent } from "../../ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";
import CalendarGridColumnPopupBodyContent from "./calendar-grid-column-popup-body-content";
import { X } from "lucide-react";

interface CalendarGridColumnPopupRendererProps {
  gridColumnDomRef: RefObject<HTMLDivElement>;
  columnDay: Date;
}

export default function CalendarGridColumnPopupRenderer({
  ...props
}: CalendarGridColumnPopupRendererProps) {
  const { gridColumnDomRef, columnDay } = props;

  const { clickPos, isPopupActive, setPopupActive } = usePopup({
    popupID: "id" + columnDay.getTime().toString(),
    columnDay,
    gridColumnDomRef,
  });

  if (!isPopupActive) return null;

  return (
    <Popover open={isPopupActive}>
      {/** Anchor the popover content to click position */}
      <PopoverAnchor
        className="w-full"
        data-calendar-grid-item-type="calendar-popover"
        style={{
          position: "absolute",
          top: `${clickPos?.y ? clickPos.y - 20 : 0}px `,
        }}
      >
        <CalendarGridColumnTimeAreaBox />
      </PopoverAnchor>
      <PopoverContent
        sideOffset={44}
        avoidCollisions={true}
        className="flex flex-col"
        id={"id" + columnDay.getTime().toString()}
      >
        <X
          className="absolute h-4 w-4 cursor-pointer self-end brightness-75 transition-all hover:brightness-125"
          onClick={() => setPopupActive(false)}
        />
        {/** This is not moving with anchor */}
        {/** TODO: Render a form here which allows users to create topic sessions at this time */}
        <CalendarGridColumnPopupBodyContent clickPos={clickPos} />
      </PopoverContent>
    </Popover>
  );
}
