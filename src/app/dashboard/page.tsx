"use client";

import { CalendarGridProvider } from "../_components/calendar-grid/calendar-grid-context";
import { CalendarGrid } from "../_components/calendar-grid/calendar-grid";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-4">
      <CalendarGridProvider>
        <CalendarGrid />
      </CalendarGridProvider>
    </main>
  );
}
