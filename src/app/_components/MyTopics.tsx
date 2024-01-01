"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import TopicCard from "src/app/_components/TopicCard";
import { z } from "zod";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export default function MyTopics() {
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<
    RouterOutputs["topic"]["getTopics"]["lastEvaluatedKey"] | null
  >(null);

  // TODO: Figure out how to implement proper pagination, useInfiniteQuery etc..
  const topics = api.topic.getTopics.useQuery(
    { limit: 3, lastEvaluatedKey: lastEvaluatedKey },
    {
      getNextPageParam: (lastPage) => {
        console.log(lastPage);
        if (lastPage.lastEvaluatedKey) {
          setLastEvaluatedKey(lastPage.lastEvaluatedKey);
        }
        return lastPage.lastEvaluatedKey;
      },
    },
  );

  return (
    <div className="grid w-screen grid-flow-row-dense grid-cols-1 items-center gap-4 rounded-lg px-8 sm:w-[80vw] sm:grid-cols-2 sm:px-2 md:grid-cols-3 lg:grid-cols-4 ">
      {!topics.data?.topics ?? <p>You have no topics</p>}
      {topics.data?.topics?.flatMap((topic) => (
        <TopicCard key={topic.Topic_ID} {...topic} />
      ))}
    </div>
  );
}
