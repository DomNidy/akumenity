// Manages the context for the calendar grid column popup
// This is intended to be provided on the page with the calendar grid only, not the dashboard route like the calendar grid context
// This is because we have our click event listeners in here

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { type CalendarGridContextData } from "../calendar-grid-definitions";
import { CalendarPopup } from "./calendar-popup";
import type { PopupData } from "./calendar-popup-definitions";
import { createPortal } from "react-dom";
import {
  clickedInsidePopup,
  getGridColumnClickData,
  getTimeFromPosition,
} from "./calendar-popup-helpers";
import { CalendarGridColumnTimeAreaBox } from "./calendar-grid-column-time-area-box";

// Props passed to the context provider
export interface CalendarGridPopupContextProps {
  // These are intended to be provided from the calendar grid context
  calendarGridContext: Pick<
    CalendarGridContextData,
    | "activePopupElementId"
    | "setActivePopupElementId"
    | "zoomLevel"
    | "cellHeightPx"
    | "minutesPerCell"
    | "activePopupElementRef"
    | "scrollAreaElementRef"
  >;
}

export type CalendarGridPopupContextData = {
  // The current popup data
  currentPopupData: PopupData | null;
  // Ref to the active popup dom element (if it exists)
  popupDomRef: React.RefObject<HTMLDivElement> | null;
  // Ref to the active time area box dom element (if it exists)
  timeAreaBoxDomRef: React.RefObject<HTMLDivElement> | null;
};

// Initialize the context
export const CalendarGridPopupContext =
  createContext<CalendarGridPopupContextData>({
    currentPopupData: null,
    popupDomRef: null,
    timeAreaBoxDomRef: null,
  });

export function CalendarGridPopupProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  calendarGridContext: CalendarGridPopupContextProps["calendarGridContext"];
}) {
  const { calendarGridContext } = props;

  const [currentPopupData, setCurrentPopupData] = useState<null | PopupData>(
    null,
  );

  // Reference to the popup DOM element
  const popupDomRef = useRef<HTMLDivElement>(null);

  // Reference to the time area box DOM element
  const timeAreaBoxDomRef = useRef<HTMLDivElement>(null);

  // TODO: Get this working, just close the popup when we scroll
  // Close the popup on scroll
  const handleScroll = useCallback(() => {
    console.log("Scrolling");
    setCurrentPopupData(null);
  }, []);

  // Add window scroll event listener when the component mounts
  useEffect(() => {
    console.log("Adding scroll event listener");
    // TODO: Instead of adding this to window, add this to the scroll area element, (from the calendar grid context)
    calendarGridContext.scrollAreaElementRef?.current?.addEventListener(
      "scroll",
      handleScroll,
    );
    return () => {
      console.log("Removing scroll event listener");
      calendarGridContext.scrollAreaElementRef?.current?.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, [handleScroll, calendarGridContext.scrollAreaElementRef?.current]);

  // Wrapped in useCallback because we only want to re-define this when the desired context values change
  // This is also a relatively expensive function to create, so we want to avoid re-creating it when we don't need to
  // Ran when the user clicks on the document
  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Get data associated with grid column click
      const columnClick = getGridColumnClickData(e);
      // If we didn't click on a grid column, set the current popup data to null
      if (!columnClick) {
        setCurrentPopupData(null);
        return;
      }

      // Get the time from the position of the click
      const clickTime = getTimeFromPosition({
        gridColumnClickData: columnClick,
        calendarGridContext: {
          cellHeightPx: calendarGridContext.cellHeightPx,
          zoomLevel: calendarGridContext.zoomLevel,
          minutesPerCell: calendarGridContext.minutesPerCell,
        },
      });

      // Did we click inside the active popup element?
      const clickedInPopup = clickedInsidePopup(popupDomRef.current, e);
      console.log("clickedInsidePopup", clickedInPopup);

      // If we clicked inside the active popup, we don't want to do anything
      if (clickedInPopup) {
        console.log("Clicked inside active popup, doing nothing");
        return;
      }

      // Do we actually have an active popup that we could of clicked on?
      // If not, create one
      if (!calendarGridContext.activePopupElementId) {
        calendarGridContext.setActivePopupElementId(columnClick.columnId);
        console.log("Creating new popup");

        // Set popup data
        setCurrentPopupData({
          clickTime: clickTime,
          ...columnClick,
        });
        return;
      }

      // When we reach this point, we know that we clicked outside the active popup, (and that we have an active popup), we should close it
      // TODO: Close active popup
      console.log("Closing active popup");
      calendarGridContext.setActivePopupElementId(null);
      setCurrentPopupData(null);

      // Did we click on a grid column?

      console.log("Column id clicked", columnClick.columnId);
      console.log("Column date clicked", columnClick.columnDate);
      console.log("Column dom element clicked", columnClick.columnDomElement);
    },
    [
      calendarGridContext.activePopupElementId,
      calendarGridContext.cellHeightPx,
      calendarGridContext.minutesPerCell,
      calendarGridContext.zoomLevel,
      currentPopupData?.columnDomElement,
    ],
  );

  // Add click event listener when the component mounts, and when the context values change
  useEffect(() => {
    console.log("Adding click event listener");
    window.addEventListener("click", handleClick);
    return () => {
      console.log("Removing click event listener");
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return (
    <CalendarGridPopupContext.Provider
      value={{
        currentPopupData,
        popupDomRef,
        timeAreaBoxDomRef,
      }}
    >
      {/* We want to portal the popup into the floating portal */}
      {currentPopupData?.columnDomElement &&
        createPortal(<CalendarPopup />, document.body)}

      {/* We want to portal the grid column time area box into the grid column */}
      {currentPopupData?.columnDomElement &&
        createPortal(
          <CalendarGridColumnTimeAreaBox
            ref={timeAreaBoxDomRef}
            className={`absolute z-[1] h-32 w-full`}
            style={{
              top: `${currentPopupData.offsetY}px`,
            }}
          />,
          currentPopupData.columnDomElement,
        )}

      {children}
    </CalendarGridPopupContext.Provider>
  );
}
