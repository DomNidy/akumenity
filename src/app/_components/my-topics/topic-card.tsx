import { type z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { type dbConstants } from "~/definitions/dbConstants";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";

import TopicUpdateForm from "./topic-update-form";
import { useState } from "react";
import { calculateTotalDifference, formatTime } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TopicColorSelector } from "./topic-color-selector";
import { TopicLabel } from "./topic-label";

export default function TopicCard({
  topic,
  recentSessions,
}: {
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>;
  recentSessions:
    | z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>[]
    | null;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [labelColor, setLabelColor] = useState<
    z.infer<typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode>
  >(topic.ColorCode ?? "blue");

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex flex-row gap-1">
          <CardTitle className="gap-2 overflow-x-hidden pb-1">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger>
                <TopicLabel colorCode={labelColor} />
              </PopoverTrigger>
              <PopoverContent
                hideWhenDetached
                onFocusOutside={() => {
                  setPopoverOpen(false);
                }}
                className="border-2 border-border p-1"
              >
                <TopicColorSelector
                  topic={topic}
                  setLabelColor={setLabelColor}
                  setPopoverOpen={setPopoverOpen}
                />
              </PopoverContent>
            </Popover>
            <span className="ml-1">{topic.Title}</span>
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
                    ColorCode: topic.ColorCode ?? "blue",
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
        <CardDescription className="min-h-5">
          {topic.Description ?? ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          {recentSessions?.length ?? 0} sessions in the past 7 days
        </p>
        <p className="text-sm text-muted-foreground">
          {formatTime(calculateTotalDifference(recentSessions) ?? 0)} studied
          recently
        </p>
      </CardContent>
    </Card>
  );
}
