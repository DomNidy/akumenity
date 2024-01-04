import MyTopics from "src/app/_components/MyTopics";
import { UserButton } from "@clerk/nextjs";
import Timeclock from "../_components/timeclock";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="fixed top-0 flex h-20 w-screen  items-center gap-6 bg-neutral-900 p-4">
        <h1 className="flex-grow text-2xl font-bold text-primary-foreground">
          Dashboard
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <MyTopics />

      <div className="mt-4 w-screen px-8 sm:w-[80vw] sm:px-2">
        <Timeclock
          topicSession={{
            SessionStatus: "active",
            SessionDuration: 1000 * 60 * 32.8,
            SessionID: "123",
            SessionSpans: ["1234", "1235"],
            SessionStart: Date.now() - 1000 * 60 * 32.8,
            Topic_ID: "123",
            Topic_Title: "Calculus",
            User_ID: "123",
          }}
        />
      </div>
    </main>
  );
}
