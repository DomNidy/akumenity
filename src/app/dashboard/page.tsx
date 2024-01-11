"use client";
import MyTopics from "~/app/_components/my-topics";
import { UserButton } from "@clerk/nextjs";
import TopicSessionManager from "../_components/topic-session-manager";

export default function Dashboard() {


  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="fixed top-0 flex h-20 w-screen  items-center gap-6 z-50 bg-neutral-900 p-4">
        <h1 className="flex-grow text-2xl font-bold text-primary-foreground ">
          Dashboard
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <MyTopics />

      {/** TODO: Allow the user to select one of their topics from a list instead of hardcoding this */}

      <TopicSessionManager />

    </main>
  );
}
