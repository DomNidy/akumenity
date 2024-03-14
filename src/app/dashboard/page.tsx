import { CalendarGrid } from "../_components/calendar-grid/calendar-grid";

export default function Dashboard() {
  return (
    <main className="fixed  min-h-screen w-[85%] flex-col justify-center p-4 sm:p-4">
      <div className="mt-4"></div>
      <CalendarGrid />
    </main>
  );
}
