// TODO: Move this type declaration to proper location
// Represents the data provided when a user clicks on a grid column
export type GridColumnClick = {
  // The date (time at which the column starts) that we clicked on
  // This column renders out data for this date from 00:00 to 23:59
  columnDate: Date;
  // The id of the grid column dom element, provided here for convenience (this corresponds to the number of days since the unix epoch)
  columnId: string;
  // The grid column dom element that we clicked inside of
  columnDomElement: HTMLElement;
  // X position of the click
  clientX: number;
  // Y position of the click
  clientY: number;
};

// TODO: Move this to a proper location
export type PopupData = {
  // Element that we should render the popup inside of (intended to be a grid column element)
  popupPortalElement: HTMLElement;
  // Ref to the popup element
  popupDomRef: React.RefObject<HTMLDivElement>;
  // The time that the user clicked (on the calendar)
  clickTime: Date;
  // The x position of the click
  clientX: number;
  // The y position of the click
  clientY: number;
};

export type CalendarPopupProps = Pick<
  PopupData,
  "clientX" | "clientY" | "clickTime" | "popupPortalElement" | "popupDomRef"
>;
