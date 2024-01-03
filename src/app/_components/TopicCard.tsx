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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export default function TopicCard(
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>,
) {
  const queryClient = useQueryClient();

  const deleteTopic = api.topic.deleteTopic.useMutation({
    onSettled: () => {
      // Invalidate topics query
      void queryClient.refetchQueries([["topic", "getTopics"]]);
    },
  });

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex  flex-row">
          <CardTitle className="overflow-x-hidden pb-1">
            {topic.Title}
          </CardTitle>
          <Dialog>
            <DialogTrigger className="ml-auto self-start">
              <MoreHorizontal />
            </DialogTrigger>
            <DialogContent>
              <DialogClose />
              {/** TODO: Add Topic edit form here */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  {deleteTopic.isLoading ? (
                    <p>Deleting...</p>
                  ) : (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you wish to delete this topic?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteTopic.mutate({
                              Topic_IDS: [topic.Topic_ID],
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
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
