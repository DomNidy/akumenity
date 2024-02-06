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
    <Command>
      <CommandInput placeholder="Search topic" />
      <CommandEmpty>No topic found</CommandEmpty>
      <CommandGroup>
        {usersTopics?.map((topic) => (
          <CommandItem
            className="cursor-pointer"
            key={topic.SK}
            value={topic.SK}
            onSelect={(currentValue) => {
              console.log(currentValue);
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
