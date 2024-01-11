import { type z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { dbConstants } from "~/definitions/dbConstants";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/dialog";

import TopicUpdateForm from "./forms/topic-update-form";
import { useState } from "react";
import { formatTime } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { api } from "~/trpc/react";

export default function TopicCard({ topic, recentSessions }: {
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>,
  recentSessions: z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>[] | null
}
) {
  const [open, setOpen] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [labelColor, setLabelColor] = useState<z.infer<typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode>>(topic.ColorCode ?? "blue");

  const updateTopic = api.topic.updateTopic.useMutation();

  // TODO: Make this use react state or make an endpoint just for this
  // Calculate the total difference between session.StartTime and session.EndTime
  const totalDifference = recentSessions?.reduce((total, session) => {
    // We use a nullish coalescing operator on session.Session_End because it may be null
    const difference = (session.Session_End ?? session.Session_Start) - session.Session_Start ?? 0;
    return total + difference;
  }, 0);

  function getLabelColor(colorCode: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>["ColorCode"]) {
    switch (colorCode) {
      case "blue":
        return "bg-blue-600";
      case "red":
        return "bg-red-600";
      case "green":
        return "bg-green-600";
      case "orange":
        return "bg-orange-600";
      case "pink":
        return "bg-pink-600";
      case "purple":
        return "bg-purple-600";
      case "yellow":
        return "bg-yellow-600";
      case "indigo":
        return "bg-indigo-600";
      default:
        return "bg-blue-600";
    }
  }


  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex flex-row gap-1">
          <CardTitle className="overflow-x-hidden pb-1 gap-2">
            <span className="mr-1">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger>
                  <div className={`w-4 h-4 rounded-full ${getLabelColor(labelColor)}`}></div>
                </PopoverTrigger>
                <PopoverContent hideWhenDetached onFocusOutside={() => { setPopoverOpen(false) }} className="p-1 border-border border-2" >

                  <h2 className="font-semibold text-lg">Pick a label for {topic.Title}</h2>
                  <div className="grid grid-cols-3 gap-2 ">
                    {
                      // Map out all the color codes and make a div for each one
                      dbConstants.itemTypes.topic.itemSchema.shape.ColorCode.options.map((colorCode) => {
                        return (
                          <div key={colorCode} className={`col-span-1 w-5 h-5 rounded-full ${getLabelColor(colorCode)}`}
                            onClick={() => {
                              updateTopic.mutate({
                                Title: topic.Title,
                                Topic_ID: topic.SK,
                                ColorCode: colorCode,
                                Description: topic.Description
                              })
                              setLabelColor(colorCode);

                              setPopoverOpen(false);
                            }}></div>
                        )
                      })
                    }

                  </div>
                </PopoverContent>
              </Popover>
            </span>
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
    </Card >
  );
}