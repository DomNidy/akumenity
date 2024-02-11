import React, { useState } from "react";

import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";

interface DateTimePickerProps {
  // This is the default selected time of the datepicker
  defaultDate: Date;
  // This is intended to update the date in the parent component
  setDate: (date: Date | undefined) => void;
}

// https://react-day-picker.js.org/guides/input-fields
// TODO: Add time picker
// TODO: Allow this component to have an initial default selected date (this should be based on where the user clicked on the calendar grid)
/**
 * @param setDate This is intended to update the date in the parent component
 * @returns
 */
export default function DateTimePicker({ ...props }: DateTimePickerProps) {
  const { defaultDate, setDate } = props;

  const [date, _setDate] = useState<Date | undefined>(defaultDate);
  const [timeValue, setTimeValue] = useState<string>("00:00");

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    // If there is no date, just set the time
    if (!date) {
      setTimeValue(time);
      return;
    }

    // Parse the time string into hours and minutes
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));

    // Create a new date with the same year, month, and day, but with the new hours and minutes
    const newSelectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
    );

    setDate(newSelectedDate);
    setTimeValue(e.target.value);
  };

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
            <p>{format(date ?? Date.now(), "PPP p")} </p>
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
          footer={
            <>
              <p>Pick a time: </p>
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
              />
              <p>
                Selected date: {date ? format(date, "PPP") : "No date selected"}
              </p>
            </>
          }
        />
      </PopoverContent>
    </Popover>
  );
}
