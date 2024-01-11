import { DashboardButton } from "~/app/_components/login-button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      <DashboardButton />
      <UserButton afterSignOutUrl="/" />
    </main>
  );
}
