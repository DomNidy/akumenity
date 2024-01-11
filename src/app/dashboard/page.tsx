"use client";
import MyTopics from "~/app/_components/my-topics";
import { UserButton } from "@clerk/nextjs";
import TopicSessionManager from "../_components/topic-session-manager";

export default function Dashboard() {


  return (
    <main className="flex min-h-screen flex-col items-center p-24">

      <UserButton afterSignOutUrl="/" />

      <MyTopics />

      {/** TODO: Allow the user to select one of their topics from a list instead of hardcoding this */}

      <TopicSessionManager />

    </main>
  );
}
