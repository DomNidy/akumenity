import React, { useState } from "react";

import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

interface DateTimePickerProps {
  // This is intended to update the date in the parent component
  setDate: (date: Date | undefined) => void;
}

// TODO: Add time picker
// TODO: Allow this component to have an initial default selected date (this should be based on where the user clicked on the calendar grid)
/**
 * @param setDate This is intended to update the date in the parent component
 * @returns
 */
export default function DateTimePicker({ ...props }: DateTimePickerProps) {
  const { setDate } = props;

  const [date, _setDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild data-item>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <p>{format(date ?? Date.now(), "PPP")} </p>
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        data-item-type="date-range-picker"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            // _setDate sets the date in the local state, setDate sets the date in the parent component
            _setDate(date);
            setDate(date);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
