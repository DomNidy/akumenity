import { api } from "~/trpc/react";

export function useTopicsQuery() {
  return api.topic.getTopics.useQuery({
    limit: 50,
  });
}
