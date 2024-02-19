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
import { useOnClickOutside } from "usehooks-ts";

// TODO: Further refine this component to be more generic, it is not ideal to need to pass in the setSelectedTopic and setPopoverOpen functions
export function TopicSelectorMenu({
  usersTopics,
  setSelectedTopic,
  setPopoverOpen,
  // Ref to the content of the popover that opens this menu
  popoverContentRef,
}: {
  usersTopics: RouterOutputs["topic"]["getTopics"]["topics"];
  setSelectedTopic: Dispatch<
    SetStateAction<{
      label: string;
      topicId: string;
    } | null>
  >;
  setPopoverOpen: Dispatch<SetStateAction<boolean>>;
  popoverContentRef: React.MutableRefObject<null>;
}) {
  // Add an event listener to close the popover when clicking outside of it
  useOnClickOutside(popoverContentRef, () => {
    setPopoverOpen(false);
  });

  return (
    <Command
      data-item-type={DataItemTypeAttributes.TopicSelectorMenu}
      aria-modal="true"
    >
      <CommandInput placeholder="Search topic" />
      <CommandEmpty>No topics found</CommandEmpty>
      <CommandGroup>
        {usersTopics?.map((topic) => (
          <CommandItem
            data-testid={`topic-selector-menu-item-${topic.Title.replace(
              " ",
              "-",
            )}`}
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
