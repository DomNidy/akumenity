import Sidebar from "../_components/sidebar";
import { Toaster } from "../_components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      <Sidebar children={children} />
      <Toaster richColors />
    </div>
  );
}
