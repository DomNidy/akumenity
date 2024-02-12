// TODO: Write tests for this

import { getDateFromDaysSinceUnixEpoch } from "~/lib/utils";
import {
  type CalendarGridContextData,
  DataItemTypeAttributes,
} from "../calendar-grid-definitions";
import { type GridColumnClick } from "./calendar-popup-definitions";

/**
 * Function which takes in the state of the calendar grid context, and a grid column click event, and returns the time of the click
 * @param {any} gridColumnClickData The data associated with the grid column click
 * @param {any} calendarGridContext State from the calendar grid context
 * @returns {any}
 */
export function getTimeFromPosition({
  gridColumnClickData,
  calendarGridContext,
}: {
  gridColumnClickData: GridColumnClick;
  calendarGridContext: Pick<
    CalendarGridContextData,
    "zoomLevel" | "cellHeightPx" | "minutesPerCell"
  >;
}) {
  const { columnDate, columnDomElement } = gridColumnClickData;
  console.log(
    "getTimeFromPosition called",
    gridColumnClickData,
    calendarGridContext,
    "gridColumnClickData and calendarGridContext",
  );

  // Create a new date, with the time set to the beginning of the columnDay (so we can simply add the calculated offset later)
  const columnBeginTime = new Date(columnDate).setHours(0, 0, 0, 0);

  // Get coordinates of the click relative to the grid column
  const { y } = getLocalXYPosition({
    clickedElement: columnDomElement,
    clientX: gridColumnClickData.clientX,
    clientY: gridColumnClickData.clientY,
  });

  // Calculate the "y cell" coordinate of the click (how many cells from the top of the column the click was)
  const yCellPosition = Math.floor(y / calendarGridContext.cellHeightPx);

  // Calculate the difference between the time associated with our click, and the beginning of the column
  const minutesSinceColumnStart =
    calendarGridContext.minutesPerCell * yCellPosition;

  // Create the date object associated with the click
  const clickTime = new Date(columnBeginTime);
  console.log(clickTime, "before set hours click time");
  clickTime.setHours(0, minutesSinceColumnStart, 0, 0);

  console.log(calendarGridContext, "context in getTimeFromPosition");
  console.log(minutesSinceColumnStart, "minutes since column start");
  console.log(columnBeginTime, "column begin time");
  console.log(clickTime, "computed click time");
  return clickTime;
}

// * Note: Unexpected behavior may occur if clientX and clientY occur outside of the passed dom element's bounding rect
/**
 * Function which returns the x and y position of a click event relative to a dom element
 * @param {any} clientX The clientX position of a click event
 * @param {any} clientY The clientY position of a click event
 * @param {any} clickedElement The dom element that was clicked on
 * @returns {any} The x and y position of the click event relative to the dom element
 */
function getLocalXYPosition({
  clientX,
  clientY,
  clickedElement,
}: {
  clientX: number;
  clientY: number;
  clickedElement: Element;
}) {
  // Get the bounding rect of the clicked element
  const boundingRect = clickedElement.getBoundingClientRect();

  return {
    x: clientX - boundingRect.left,
    y: clientY - boundingRect.top,
  };
}

/**
 * Checks if the mouse event occured inside the provided element or its children
 *
 * @param element - The element to check, can be null in which case this will always return false.
 * @param e - The mouse event.
 * @returns True if the element contains the target of the mouse event, false otherwise.
 */
function clickedInsideElement(
  element: HTMLElement | null | undefined,
  e: MouseEvent,
) {
  console.log("element", element);
  console.log("e.target", e.target);
  if (!element) return false;
  return element.contains(e.target as Node);
}

// Function which returns true if the popup occured in a child element of the popup,
// including elements that are not direct children (like the topic selector menu with its data-item-type attribute)
export function clickedInsidePopup(element: HTMLElement | null, e: MouseEvent) {
  console.log("Check : passed element", element);
  // Check if the target of the click event is a direct child of the popup
  if (clickedInsideElement(element, e)) {
    console.log("Check : Direct child click");
    return true;
  }

  const target = e.target as HTMLElement;
  console.log("Check :", target);
  // Clicking on a child of the popup with these data-item-type attributes will also count as clicking inside the popup
  const allowedDataItemTypes = [
    DataItemTypeAttributes.TopicSelectorMenu,
    DataItemTypeAttributes.DateTimePicker,
  ];

  // Loop through the allowed data item types and check if the target of the click event is a child of the popup with one of these data-item-type attributes
  for (const dataItemType of allowedDataItemTypes) {
    const selector = `[data-item-type="${dataItemType}"]`;

    console.log("Check : Checking for", selector);
    const found = target.closest(selector);

    console.log("Check : Found", found);

    if (target.closest(`[data-item-type="${dataItemType}"]`)) {
      console.log("Check : Found topic selector menu");
      return true;
    } else {
      console.log(`Check : Did not find ${dataItemType} menu`);
    }
  }

  return false;
}

// TODO: Write tests for this
/**
 * When provided a click event, if this click event occured inside a grid column, return the data associated with the click (relative to the grid column)
 * otherwise return null
 * @param {any} e:MouseEvent the click event
 * @returns {any} the id of the grid column, or null if the click event did not occur inside a grid column
 */
export function getGridColumnClickData(e: MouseEvent): GridColumnClick | null {
  const target = e.target as HTMLElement;

  // Try to find a grid column ancestor element from the target of the click event
  const gridColumnElement = target.closest(
    `[data-item-type="${DataItemTypeAttributes.CalendarGridColumn}"]`,
  );

  // Get the id of the grid column (if we found one)
  const gridColumnId = gridColumnElement?.getAttribute("id");

  // Check if the grid column element is an instance of HTMLElement
  const isHTMLElement = gridColumnElement instanceof HTMLElement;

  // If the click event did not occur inside a grid column, or the column does not have an id, return null
  if (!gridColumnId || !gridColumnElement || !isHTMLElement) {
    console.log("click event", e);
    console.log("gridColumnId", gridColumnId);
    console.log("gridColumnElement", gridColumnElement);
    console.log("isHTMLElement", isHTMLElement);
    console.log(
      "Did not occur inside grid column or column does not have id, or the gridColumnElement is not an instance of HTMLElement",
    );
    return null;
  }

  return {
    columnDomElement: gridColumnElement,
    columnDate: getDateFromDaysSinceUnixEpoch(parseInt(gridColumnId)),
    columnId: gridColumnId,
    clientX: e.clientX,
    clientY: e.clientY,
  } as GridColumnClick;
}
