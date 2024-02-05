"use client";

import { CalendarGrid } from "../_components/calendar-grid/calendar-grid";
import MyTopics from "../_components/my-topics/my-topics";
import TopicSessionManager from "../_components/my-topics/topic-session-manager";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-4">
      <MyTopics />
      <TopicSessionManager />
      <div className="mt-4"></div>
      <CalendarGrid />
    </main>
  );
}
