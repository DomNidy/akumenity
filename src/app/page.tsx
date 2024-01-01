import { DashboardButton } from "src/app/_components/DashboardButton";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      <DashboardButton />
      <UserButton afterSignOutUrl="/" />
    </main>
  );
}
