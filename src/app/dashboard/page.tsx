"use client";
import MyTopics from "~/app/_components/my-topics";
import TopicSessionManager from "../_components/topic-session-manager";

export default function Dashboard() {


  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <MyTopics />
      <TopicSessionManager />
    </main>
  );
}
