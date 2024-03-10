import { CalendarGridProvider } from "../_components/calendar-grid/calendar-grid-context";
import Sidebar from "../_components/sidebar/sidebar";
import { Toaster } from "../_components/ui/sonner";

// TODO: It would be ideal for the CalendarGridProvider to be on the page that uses the calendar grid
// TODO: The only reason we declare it here is because the daySessionMap 'alreadyProcessed' state gets
// TODO: cleared when we leave the page that uses the calendar grid
// TODO: but the react query cache is not cleared, so we end up rendering duplicate sessions
// TODO: However, we do not want to just clear the react query cache, as that would cause a full refetch of all the data
// TODO: To alleviate this we should create a context specifically for the daySessionMap, and wrap the layout in it,
// TODO: then, from the calendar we can use that context to manage the daySessionMap state
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
        <div className="ml-14 sm:ml-24">{children}</div>
      </CalendarGridProvider>
    </div>
  );
}
