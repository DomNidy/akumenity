import { type TopicItemSchema } from "src/definitions/TopicDefinitions";
import { type z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function TopicCard(topic: z.infer<typeof TopicItemSchema>) {
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="overflow-x-hidden pb-1">{topic.Title}</CardTitle>
        <CardDescription>{topic.Description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          2 hours, 34 minutes this week.
        </p>
      </CardContent>
    </Card>
  );
}
