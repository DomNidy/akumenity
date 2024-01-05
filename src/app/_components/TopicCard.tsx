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

export default function TopicCard(
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>,
) {
  const [open, setOpen] = useState<boolean>(false);

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
        <CardDescription>{topic.Description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          2 hours, 34 minutes this week.
        </p>
      </CardContent>
    </Card>
  );
}
