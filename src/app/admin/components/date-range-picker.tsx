"use client";

import React, { useState, useEffect } from "react";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, endOfDay, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PropsArray = {
  sendDataToParent?: any;
  className?: React.HTMLAttributes<HTMLDivElement>;
  searchParams?: { [key: string]: string | string[] | undefined };
};
export function CalendarDateRangePicker({
  className,
  sendDataToParent,
  searchParams,
}: PropsArray) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (
      searchParams &&
      typeof searchParams["filter_date_range_start"] === "string" &&
      typeof searchParams["filter_date_range_end"] === "string" &&
      searchParams["filter_date_range_start"] &&
      searchParams["filter_date_range_end"]
    ) {
      return {
        from: new Date(searchParams["filter_date_range_start"]),
        to: new Date(searchParams["filter_date_range_end"]),
      };
    } else {
      return {
        from: subMonths(new Date(), 3),
        to: new Date(),
      };
    }
  });
  useEffect(() => {
    sendDataToParent({
      from: date?.from,
      to: date?.to ? endOfDay(date?.to) : new Date(),
    });
  }, []);
  return (
    <div className={cn("w-full lg:w-[250px] grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full lg:w-[250px] justify-center text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selDate) => {
              sendDataToParent({
                from: selDate?.from,
                to: selDate?.to ? endOfDay(selDate?.to) : new Date(),
              });
              setDate(selDate);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
