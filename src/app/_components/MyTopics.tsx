"use client";
import TopicCard from "src/app/_components/TopicCard";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";

export default function MyTopics() {
  // TODO: Figure out how to implement proper pagination, useInfiniteQuery etc..
  const topics = api.topic.getTopics.useInfiniteQuery(
    { limit: 20 },

    {
      getNextPageParam: (lastPage) => {
        console.log(lastPage);
        return lastPage.cursor;
      },
    },
  );

  return (
    <div className="grid w-screen grid-flow-row-dense grid-cols-1 items-center gap-4 rounded-lg px-8 sm:w-[80vw] sm:grid-cols-2 sm:px-2 md:grid-cols-3 lg:grid-cols-4 ">
      {!topics.data?.pages ?? <p>You have no topics</p>}
      {topics.data?.pages?.flatMap(
        (page) =>
          page.topics?.map((topic) => (
            <TopicCard key={topic.Topic_ID} {...topic} />
          )),
      )}
      {topics.hasNextPage && (
        <Button onClick={() => topics.fetchNextPage()}>Fetch more</Button>
      )}
    </div>
  );
}
