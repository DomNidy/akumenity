import { forwardRef, type HTMLAttributes } from "react";
import { type z } from "zod";
import { type dbConstants } from "~/definitions/dbConstants";
import { getLabelColor } from "~/lib/utils";

interface TopicLabelProps extends HTMLAttributes<HTMLDivElement> {
  colorCode?: z.infer<
    typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
  >;
}

// Renders out a label icon with specific color
export const TopicLabel = forwardRef<HTMLDivElement, TopicLabelProps>(
  ({ ...props }, ref) => (
    <div
      ref={ref}
      className={`h-5 w-5 rounded-full ${getLabelColor(
        props.colorCode ?? "blue",
      )}`}
      {...props}
    />
  ),
);
