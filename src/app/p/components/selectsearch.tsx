"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { setAny } from "@/app/p/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

type LocationOption = {
  value: string;
  label: string;
};

type LocationArray = {
  selectsearch_options: LocationOption[];
  sendDataToParent?: any;
  dataName: string;
};
export function SelectSearch({
  selectsearch_options,
  sendDataToParent,
  dataName,
}: LocationArray) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  if (!selectsearch_options) return <></>;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? selectsearch_options.find(
                (currentoptions) => currentoptions.value === value
              )?.label
            : `Select ${dataName}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search keywords..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <ScrollArea className="h-[200px] w-[350px]">
            <CommandGroup>
              {selectsearch_options.map((currentoptions, optionIdx) => (
                <CommandItem
                  key={`${optionIdx}_${currentoptions.value}`}
                  value={currentoptions.value}
                  onSelect={(currentValue) => {
                    setValue(
                      currentoptions.value === value ? "" : currentoptions.value
                    );
                    sendDataToParent(
                      currentoptions.value === value ? "" : currentoptions.value
                    );

                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === currentoptions.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {currentoptions.label}
                </CommandItem>
              ))}
            </CommandGroup>{" "}
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
