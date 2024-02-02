import { CalendarGridProvider } from "../_components/calendar-grid/calendar-grid-context";
import Sidebar from "../_components/sidebar";
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
        {children}
      </CalendarGridProvider>
    </div>
  );
}
