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
        <p>Topic Card</p>
      </CardContent>
    </Card>
  );
}
