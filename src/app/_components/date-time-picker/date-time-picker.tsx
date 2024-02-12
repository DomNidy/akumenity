import React, { useState } from "react";

import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { DataItemTypeAttributes } from "../calendar-grid/calendar-grid-definitions";
import { getHHMMStringFromDate } from "./date-time-picker-helpers";

interface DateTimePickerProps {
  // This is the default selected time of the datepicker
  defaultDate: Date;
  // This is intended to update the date in the parent component
  setDate: (date: Date | undefined) => void;
}

// https://react-day-picker.js.org/guides/input-fields

/**
 * @param setDate This is intended to update the date in the parent component
 * @returns
 */
export default function DateTimePicker({ ...props }: DateTimePickerProps) {
  const { defaultDate, setDate } = props;

  // If the calendar is open
  const [calendarOpen, setCalendarOpen] = useState(false);

  // If the time input is open
  const [timeOpen, setTimeOpen] = useState(false);

  // The actual time associated with the date
  const [date, _setDate] = useState<Date>(defaultDate);
  // Time input value
  const [timeValue, setTimeValue] = useState<string>(
    getHHMMStringFromDate(date),
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeValue(time);

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

    console.log(newSelectedDate);

    _setDate(newSelectedDate);
    setDate(newSelectedDate);
  };

  return (
    <div className="flex flex-row">
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => setCalendarOpen(true)}
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
          data-item-type={DataItemTypeAttributes.DateTimePicker}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              // _setDate sets the date in the local state, setDate sets the date in the parent component
              _setDate(date ?? new Date());
              setDate(date);
              setCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full justify-start text-left"
          >
            <p>{format(date, "p")}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Input type="time" value={timeValue} onChange={handleTimeChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
