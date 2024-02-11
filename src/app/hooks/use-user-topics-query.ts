import { api } from "~/trpc/react";

export function useUserTopicsQuery() {
  return api.topic.getTopics.useQuery({
    limit: 50,
  });
}
