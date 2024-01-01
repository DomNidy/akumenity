"use client";

import TopicCard from "src/app/_components/TopicCard";
import { api } from "~/trpc/react";

export default function MyTopics() {
  const topics = api.topic.getTopics.useQuery();

  return (
    <div className="grid w-screen grid-flow-row-dense grid-cols-1 items-center gap-4 rounded-lg px-8 sm:w-[80vw] sm:grid-cols-2 sm:px-2 md:grid-cols-3 lg:grid-cols-4 ">
      {!topics.data?.topics ?? <p>You have no topics</p>}
      {topics.data?.topics?.flatMap((topic) => (
        <TopicCard key={topic.Topic_ID} {...topic} />
      ))}
    </div>
  );
}
