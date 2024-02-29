// This component provides the UI for updating the color of a topic

import { forwardRef, type Dispatch, type SetStateAction } from "react";
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

  const updateColorTo = (
    colorCode: z.infer<
      typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
    >,
  ) => {
    // Set query to update the color of the topic
    updateTopic.mutate({
      Title: topic.Title,
      Topic_ID: topic.SK,
      ColorCode: colorCode,
      Description: topic.Description,
    });

    // Update the color state locally
    setLabelColor(colorCode);

    // Close the popover
    setPopoverOpen(false);
  };

  return (
    <div className="grid grid-cols-3 content-center justify-items-center gap-4">
      {
        // Map out all the color codes and make a div for each one
        dbConstants.itemTypes.topic.itemSchema.shape.ColorCode.options.map(
          (colorCode, idx) => {
            return (
              <div
                data-testid={`color-selector-${colorCode}`}
                tabIndex={idx + 1}
                key={colorCode}
                className={`col-span-1  h-5 w-5 rounded-full ${getLabelColor(
                  colorCode,
                )} cursor-pointer hover:saturate-150`}
                onClick={() => {
                  updateColorTo(colorCode);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateColorTo(colorCode);
                }}
              ></div>
            );
          },
        )
      }
    </div>
  );
}
