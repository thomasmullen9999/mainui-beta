"use client";

import React, { useEffect, useState } from "react";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { setDate1 } from "@/app/p/actions";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cookies } from "next/headers";

interface DatePickerProp {
  inDate: Date;
}

export function MCDatePicker({ inDate }: DatePickerProp) {
  const [date, setDate] = React.useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // useEffect(() => {
  //   if (date) {
  //     setDate1(date || new Date());
  //   }
  // }, [date]);
  if (inDate && !date) setDate(inDate);

  function setIDate(inDateselection: Date | undefined) {
    if (!inDateselection) return;
    setDate1(inDateselection);
    setDate(inDateselection);
  }
  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "MCdatepickerbtn w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="MCdatepickerPopOver w-auto p-0">
        <Calendar
          required
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(selDate) => {
            setIDate(selDate);
            setCalendarOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
