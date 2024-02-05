// This component provides the UI for updating the color of a topic

import { type Dispatch, type SetStateAction } from "react";
import { type z } from "zod";
import { dbConstants } from "~/definitions/dbConstants";
import { getLabelColor } from "~/lib/utils";
import { api } from "~/trpc/react";

export function TopicColorSelector({
  topic,
  setLabelColor,
  setPopoverOpen,
}: {
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>;
  setLabelColor: Dispatch<
    SetStateAction<
      z.infer<typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode>
    >
  >;
  setPopoverOpen: (open: boolean) => void;
}) {
  const updateTopic = api.topic.updateTopic.useMutation();

  return (
    <div className="grid grid-cols-3 content-center justify-items-center gap-4">
      {
        // Map out all the color codes and make a div for each one
        dbConstants.itemTypes.topic.itemSchema.shape.ColorCode.options.map(
          (colorCode) => {
            return (
              <div
                key={colorCode}
                className={`col-span-1  h-5 w-5 rounded-full ${getLabelColor(
                  colorCode,
                )} cursor-pointer hover:saturate-150`}
                onClick={() => {
                  updateTopic.mutate({
                    Title: topic.Title,
                    Topic_ID: topic.SK,
                    ColorCode: colorCode,
                    Description: topic.Description,
                  });
                  setLabelColor(colorCode);
                  setPopoverOpen(false);
                }}
              ></div>
            );
          },
        )
      }
    </div>
  );
}
