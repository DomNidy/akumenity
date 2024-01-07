import { type z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { type dbConstants } from "~/definitions/dbConstants";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/dialog";

import TopicUpdateForm from "./forms/topic-update-form";
import { useState } from "react";
import { formatTime } from "~/lib/utils";

export default function TopicCard({ topic, recentSessions }: {
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>,
  recentSessions: z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>[] | null
}
) {
  const [open, setOpen] = useState<boolean>(false);

  // TODO: Make this use react state or make an endpoint just for this
  // Calculate the total difference between session.StartTime and session.EndTime
  const totalDifference = recentSessions?.reduce((total, session) => {
    // We use a nullish coalescing operator on session.Session_End because it may be null
    const difference = (session.Session_End ?? session.Session_Start) - session.Session_Start ?? 0;
    return total + difference;
  }, 0);


  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex  flex-row">
          <CardTitle className="overflow-x-hidden pb-1">
            {topic.Title}
          </CardTitle>
          <Dialog open={open} onOpenChange={(op) => setOpen(op)}>
            <DialogTrigger className="ml-auto self-start">
              <MoreHorizontal onClick={() => setOpen(!open)} />
            </DialogTrigger>
            <DialogContent>
              <DialogClose />
              <div className="flex flex-col">
                {" "}
                <TopicUpdateForm
                  closeParentDialog={() => setOpen(false)}
                  topic={{
                    SK: topic.SK,
                    Title: topic.Title,
                    Description: topic.Description,
                    PK: topic.PK,
                  }}
                />
              </div>
              {/** TODO: Add Topic edit form here */}
            </DialogContent>
          </Dialog>
        </div>
        {/** Using min-h-5 here to force a 'newline', basically just makes cards with and without descriptions look like the text is aligned */}
        <CardDescription className="min-h-5">{topic.Description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          {recentSessions?.length ?? 0} sessions in the past 7 days
        </p>
        <p className="text-sm text-muted-foreground">
          {formatTime(totalDifference ?? 0)} studied recently
        </p>
      </CardContent>
    </Card>
  );
}
