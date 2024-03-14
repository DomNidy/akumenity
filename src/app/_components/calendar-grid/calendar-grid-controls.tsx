import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ZoomOut, ZoomIn } from "lucide-react";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { getDisplayDateBounds } from "~/lib/utils";

// Resonsible for rendering the controls for the calendar grid
export function CalendarGridControls() {
  const calendarGridContext = useCalendarGrid();
  const userPreferences = useUserPreferences();

  return (
    <div className="flex  gap-2">
      <div className="flex flex-row justify-between gap-2">
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
      <div className="flex flex-row justify-between gap-2">
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
      <div className="flex flex-row justify-between gap-2">
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

      <div className="flex flex-row justify-between gap-2">
        <Button
          className=" w-fit"
          onClick={() => {
            calendarGridContext.setCellHeightPx(60);
            calendarGridContext.setZoomLevel(1);
          }}
        >
          Reset view
        </Button>

        <Button
          className=" w-fit"
          onClick={() => {
            const date = new Date();

            // Calculate the bounds of the current time
            const newBounds = getDisplayDateBounds(
              userPreferences.displayMode,
              date,
              userPreferences.weekStartsOn,
            );

            // Set the display bounds to the current time
            calendarGridContext.setDisplayDateBounds(
              newBounds.beginDate,
              newBounds.endDate,
            );

            // Scroll to the current time element
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
    </div>
  );
}
