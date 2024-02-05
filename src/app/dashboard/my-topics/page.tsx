"use client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import MyTopics from "~/app/_components/my-topics/my-topics";
import TopicSessionManager from "~/app/_components/my-topics/topic-session-manager";

export default function Dashboard() {
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(searchParams.getAll("query"));
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-4">
      <MyTopics />
      <div className="mt-4"></div>
      <TopicSessionManager />
    </main>
  );
}
