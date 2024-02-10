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

  // Whenever the active popup id changes, set the popup active state
  useEffect(() => {
    if (calendarGridContext.activePopupElementId === popupID) {
      setIsPopupActive(true);
    } else {
      setIsPopupActive(false);
    }
  }, [popupID, calendarGridContext.activePopupElementId]);

  // Function exported which allows us to set the popup active state
  function setPopupActive(active: boolean) {
    setIsPopupActive(active);
    if (active) {
      calendarGridContext.setActivePopupElementId(popupID);
    } else {
      calendarGridContext.setActivePopupElementId("");
    }
  }

  // Function which determines whether or not a click was located inside the gridColumn
  function isInGridColumn(e: MouseEvent) {
    if (gridColumnDomRef.current) {
      return gridColumnDomRef.current.contains(e.target as Node);
    }
    return false;
  }

  // TODO: Review this, i think its actually redundant
  // Function which determines if the clicked element is a child of the popup, or the popup itself
  function isInPopupElement(e: MouseEvent) {
    return (
      e.target instanceof Element && e.target.closest(`#${popupID}`) !== null
    );
  }

  // TODO: Fix down the line: Kind of performance heavy since there may be 7 of these, would be better to have a single one, and read from the context
  // * Global event listener Add event listener to window to close the popup when the user clicks outside of it
  useEffect(() => {
    function closePopup(e: MouseEvent) {
      // When we click, and the popup is not active, and its inside the grid column set it to active
      if (!isPopupActive && isInGridColumn(e)) {
        console.log("Opening");
        calendarGridContext.setActivePopupElementId(popupID);
        setIsPopupActive(true);
        return;
      }

      // When we click, and the popup is already active, and the click is not inside the popup, close the popup
      if (isPopupActive && !isInPopupElement(e)) {
        calendarGridContext.setActivePopupElementId("");
        setIsPopupActive(false);
        return;
      }
    }

    window.addEventListener("click", closePopup);

    return () => {
      window.removeEventListener("click", closePopup);
    };
  }, [isPopupActive, popupID]);

  return { clickPos, isPopupActive, setPopupActive };
}
