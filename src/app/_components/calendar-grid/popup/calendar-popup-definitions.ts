// TODO: Move this type declaration to proper location
// Represents the data provided when a user clicks on a grid column
export type GridColumnClick = {
  // The date (time at which the column starts) that we clicked on
  // This column renders out data for this date from 00:00 to 23:59
  columnDate: Date;
  // The id of the grid column dom element, provided here for convenience (this corresponds to the number of days since the unix epoch)
  columnId: string;
  // The grid column dom element that we clicked inside of
  // We will portal grid area boxes into this element
  columnDomElement: HTMLElement;
  // X position of the click, we use this to render the time area box on the grid column
  offsetX: number;
  // Y position of the click, we use this to render the time area box on the grid column
  offsetY: number;
  // The clientX of the click event (relative to the viewport)
  clientX: number;
  // The clientY of the click event (relative to the viewport)
  clientY: number;
};

// TODO: Move this to a proper location
export type PopupData = Pick<
  GridColumnClick,
  "columnDomElement" | "offsetX" | "offsetY" | "clientX" | "clientY"
> & {
  // The time that the user clicked (on the calendar)
  clickTime: Date;
};
