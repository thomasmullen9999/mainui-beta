import { Layers3, Folder } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { countLeadByCampaign } from "@/app/admin/actions";

type PropsArray = {
  sendDataToParent?: any;
  searchParams?: { [key: string]: string | string[] | undefined };
};
export function CampaginFilter({ sendDataToParent, searchParams }: PropsArray) {
  const [selectedValues, setSelectedValues] = useState(
    new Set(
      (searchParams &&
        typeof searchParams["filter_lead_campaign"] === "string" &&
        (searchParams["filter_lead_campaign"] as string).split(",")) || [
        "justeat",
        "sainsburys",
        "asda",
        "coop",
        "morrisons",
        "bolt",
        "next",
      ]
    )
  );

  const [leadStats, setLeadStats] = useState(new Map());

  const options = [
    {
      value: "asda",
      label: "Asda",
      icon: Folder,
    },
    {
      value: "coop",
      label: "Co-op",
      icon: Folder,
    },
    {
      value: "morrisons",
      label: "Morrisons",
      icon: Folder,
    },
    {
      value: "next",
      label: "Next",
      icon: Folder,
    },
    {
      value: "sainsburys",
      label: "Sainsbury's",
      icon: Folder,
    },
    {
      value: "bolt",
      label: "Bolt",
      icon: Folder,
    },
    {
      value: "justeat",
      label: "Justeat",
      icon: Folder,
    },
  ];
  const title = "Filter Campagin";

  useEffect(() => {
    async function fetchData() {
      try {
        const facets = await countLeadByCampaign();
        setLeadStats(facets);
      } catch (error) {
        console.error("Error fetching campaign counts:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    sendDataToParent(selectedValues);
  }, []);

  const toggleSelect = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    setSelectedValues(newSelectedValues);
    sendDataToParent(newSelectedValues);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 w-full lg:w-auto">
          <Layers3 className="mr-2 h-4 w-4" />
          Filter Campaign
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      // if (isSelected) {
                      //   selectedValues.delete(option.value);
                      // } else {
                      //   selectedValues.add(option.value);
                      // }
                      // const filterValues = Array.from(selectedValues);
                      // setSelectedValues(selectedValues);
                      toggleSelect(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {leadStats?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {leadStats.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelectedValues(new Set())}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
