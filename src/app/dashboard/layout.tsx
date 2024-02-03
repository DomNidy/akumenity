import { CalendarGridProvider } from "../_components/calendar-grid/calendar-grid-context";
import Sidebar from "../_components/sidebar/sidebar";
import { Toaster } from "../_components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CalendarGridProvider>
        <Sidebar />
        <Toaster richColors />
        <div className="sm:ml-24 ml-14">{children}</div>
      </CalendarGridProvider>
    </div>
  );
}
