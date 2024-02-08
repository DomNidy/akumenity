// Responsible for updating the calendar grid context state for the active popup

import { useCalendarGrid } from "./use-calendar-grid";
import { useEffect, useState } from "react";
import { useTimeFromPosition } from "./use-time-from-position";

interface UsePopupProps {
  // Corresponds to the id of the popup element we want to set as active
  popupID: string;
  // The grid column dom ref to place the popup
  gridColumnDomRef: React.RefObject<HTMLDivElement>;
  // The column day
  columnDay: Date;
}

/**
 * When passed a ref to a dom element, will listen for clicks on that element, and set the active popup element id to the specified id
 * @param popupID dom element id of the element we want to show as active when the user clicks on the gridColumnDomRef
 * @param gridColumnDomRef ref to the grid column dom element, ie the element that triggers the popup
 * @param columnDay the day associated with the grid column
 * @returns `clickPos` - the position of the click and the associated time, `isPopupActive` - whether the popup should be active
 */
export function usePopup({ ...props }: UsePopupProps) {
  const { popupID, gridColumnDomRef, columnDay } = props;

  // Calculate the time from the click position
  const { clickPos } = useTimeFromPosition({
    gridColumnDomRef,
    columnDay,
  });

  // If the popup should be active, set true
  const [isPopupActive, setIsPopupActive] = useState(false);

  const calendarGridContext = useCalendarGrid();

  // WHenever the click position changes, set the active popup element id
  useEffect(() => {
    if (clickPos) {
      calendarGridContext.setActivePopupElementId(popupID);
    }
  }, [clickPos, popupID]);

  // Whenever the active popup element id changes, set the popup active state
  useEffect(() => {
    if (calendarGridContext.activePopupElementId === popupID) {
      setIsPopupActive(true);
    } else {
      setIsPopupActive(false);
    }
  }, [calendarGridContext.activePopupElementId, popupID]);

  // * Global event listener Add event listener to window to close the popup when the user clicks outside of it
  useEffect(() => {
    function closePopup(e: MouseEvent) {
      if (e.target instanceof Element) {
        // TODO: This does not close the popup if the user clicks on a child element of the grid which the popup is located in
        // TODO: Fix that, use a different selector/approach
        if (!e.target.closest(`#${popupID}`)) {
          calendarGridContext.setActivePopupElementId("");
          setIsPopupActive(false);
        }
      }
    }

    if (isPopupActive) {
      window.addEventListener("click", closePopup);
    }

    return () => {
      window.removeEventListener("click", closePopup);
    };
  }, [isPopupActive, popupID]);

  return { clickPos, isPopupActive };
}
