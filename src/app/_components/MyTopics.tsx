"use client";
import TopicCard from "src/app/_components/TopicCard";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import TopicCreateForm from "./forms/topic-create-form";
import { useMemo } from "react";
import { z } from "zod";
import { dbConstants } from "~/definitions/dbConstants";




export default function MyTopics() {
  // TODO: Implement proper pagination, useInfiniteQuery etc..
  const topics = api.topic.getTopics.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.cursor;
      },
    },
  );

  // Use memo to prevent re-rendering (as Date.now() changing would cause a re-render and re-query)
  const queryRangeStartTime = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

  // Stores the amount of time spent on each topic in the past 7 days
  const topicsTimeSummary = api.topicSession.getTopicsTimeSummary.useQuery({
    dateRange: {
      startTimeMS: queryRangeStartTime,
    },
    cursor: null
  });

  return (
    <div className="grid w-screen grid-flow-row-dense grid-cols-1 items-center gap-4 rounded-lg px-8 sm:w-[80vw] sm:grid-cols-2 sm:px-2 md:grid-cols-3 lg:grid-cols-4 ">
      {!topics.data?.pages ?? <p>You have no topics</p>}
      {topics.data?.pages?.flatMap(
        (page) =>
          page.topics?.map((topic) => {
            const matchingSessions = topicsTimeSummary.data?.filter(
              (session: z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>) => {

                // Each TopicCard should have a list of recent sessions for the topic (in the past 7 days)
                if (session.Topic_ID === topic.SK) {
                  return session;
                }
              }
            ) as z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>[] | null | undefined;

            return <TopicCard key={topic.SK} topic={topic} recentSessions={matchingSessions ?? null} />;
          }),
      )}
      <TopicCreateForm />

      {topics.hasNextPage && (
        <Button onClick={() => topics.fetchNextPage()}>Fetch more</Button>
      )}
    </div>
  );
}
