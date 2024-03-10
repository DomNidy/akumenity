import { CheckIcon, FilterIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "~/lib/utils";
import { useEffect, useMemo, useState } from "react";

/**
 * @param filterOptionsArray - An array of options which we can add to our filter
 * @param setFilterValue - Function which sets the filter value for a specific column
 * @returns
 */
export function SessionTableFilterCombobox({
  setFilterValue,
  filterOptionsArray,
}: {
  setFilterValue: (value: string[]) => void;
  filterOptionsArray: { key: string; value: string }[];
}) {
  const [enabledOptions, setEnabledOptions] = useState<Set<string>>();

  // Since we may be passed filter options with duplicate key & values, we filter them out
  const uniqueFilterOptions = useMemo(() => {
    // Only allow unique values
    const uniqueValues = new Set(
      filterOptionsArray.map((option) => option.key),
    );
    return filterOptionsArray.filter((option) => {
      if (uniqueValues.has(option.key)) {
        uniqueValues.delete(option.key);
        return true;
      }
      return false;
    });
  }, [filterOptionsArray]);

  // Whenever the enabledOptions change, we update the filter value
  useEffect(() => {
    setFilterValue(Array.from(enabledOptions ?? []));
  }, [enabledOptions, setFilterValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"}>
          <FilterIcon className="inset-0 m-auto h-4 w-4"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Filter by topics" />
          <CommandEmpty>No matching topics found...</CommandEmpty>
          <CommandGroup>
            {/** The option.value and option.key should be the same thing usually, the key always should correspond to a column id in the table */}
            {uniqueFilterOptions.map((option) => (
              <CommandItem
                value={option.value}
                key={option.key}
                className="cursor-pointer"
                onSelect={() => {
                  // If the option is already enabled, we remove it from the set
                  if (enabledOptions?.has(option.key)) {
                    setEnabledOptions((prev) => {
                      prev?.delete(option.key);
                      return new Set(prev);
                    });
                  } else {
                    setEnabledOptions((prev) => {
                      if (prev === undefined) {
                        return new Set([option.key]);
                      } else {
                        prev.add(option.key);
                        return new Set(prev);
                      }
                    });
                  }
                }}
              >
                {option.value}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    enabledOptions?.has(option.key)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
