// Renders out a command menu which allows you to select a topic

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { type RouterOutputs } from "~/trpc/react";
import { type Dispatch, type SetStateAction } from "react";
import { DataItemTypeAttributes } from "../calendar-grid/calendar-grid-definitions";

// TODO: Further refine this component to be more generic, it is not ideal to need to pass in the setSelectedTopic and setPopoverOpen functions
export function TopicSelectorMenu({
  usersTopics,
  setSelectedTopic,
  setPopoverOpen,
}: {
  usersTopics: RouterOutputs["topic"]["getTopics"]["topics"];
  setSelectedTopic: Dispatch<
    SetStateAction<{
      label: string;
      topicId: string;
    } | null>
  >;
  setPopoverOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Command data-item-type={DataItemTypeAttributes.TopicSelectorMenu}>
      <CommandInput placeholder="Search topic" />
      <CommandEmpty>No topics found</CommandEmpty>
      <CommandGroup>
        {usersTopics?.map((topic) => (
          <CommandItem
            className="cursor-pointer"
            key={topic.SK}
            value={topic.SK}
            onSelect={() => {
              setSelectedTopic({
                label: topic.Title,
                topicId: topic.SK,
              });
              setPopoverOpen(false);
            }}
          >
            {topic.Title}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}
