import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ZoomOut, ZoomIn } from "lucide-react";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";

// Resonsible for rendering the controls for the calendar grid
export function CalendarGridControls() {
  const calendarGridContext = useCalendarGrid();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.decrementPage();
          }}
        >
          <ChevronLeft />
        </Button>
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.incrementPage();
          }}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel - 1);
          }}
        >
          <ZoomOut />
        </Button>
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.setZoomLevel(calendarGridContext.zoomLevel + 1);
          }}
        >
          <ZoomIn />
        </Button>
      </div>
      <div className="flex flex-row justify-between">
        <Button
          className="aspect-square p-0"
          disabled={calendarGridContext.cellHeightPx <= 6}
          onClick={() => {
            calendarGridContext.setCellHeightPx(
              calendarGridContext.cellHeightPx - 5,
            );
          }}
        >
          -
        </Button>
        <Button
          className="aspect-square p-0"
          onClick={() => {
            calendarGridContext.setCellHeightPx(
              calendarGridContext.cellHeightPx + 5,
            );
          }}
        >
          +
        </Button>
      </div>

      <Button
        className="mt-2"
        onClick={() => {
          calendarGridContext.setCellHeightPx(60);
          calendarGridContext.setZoomLevel(1);
        }}
      >
        Reset view
      </Button>

      {/* //TODO: Make this also go to the current time span (day or week etc) } */}
      <Button
        className="mt-2"
        onClick={() => {
          calendarGridContext.currentTimeElementRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }}
      >
        Go to current time
      </Button>
    </div>
  );
}
