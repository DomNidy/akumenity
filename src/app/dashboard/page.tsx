"use client";
import MyTopics from "~/app/_components/my-topics";
import TopicSessionManager from "../_components/topic-session-manager";
import { CalendarGridProvider } from "../_components/calendar-grid/calendar-grid-context";
import { CalendarGrid } from "../_components/calendar-grid/calendar-grid";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-4">
      {/** <MyTopics /> */}
      <div className="mt-4"></div>
      {/**<TopicSessionManager />*/}

      <CalendarGridProvider >
        <CalendarGrid />
      </CalendarGridProvider>
    </main>
  );
}
