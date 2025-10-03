"use client";
import React, { useState, useEffect } from "react";
import { CalendarDateRangePicker } from "@/app/admin/components/date-range-picker";
import { CampaginFilter } from "@/app/admin/components/campaignfilter";
import { Input } from "@/components/ui/input";
import { searchLeadHistory } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { addDays, format, endOfDay, subMonths } from "date-fns";
import { StatusFilter } from "./statusfilter";

export function SearchBox({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [dateRangeStart, setDateRangeStart] = useState(
    subMonths(new Date(), 3)
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date());
  const [leadcampagin, setLeadcampaign] = useState(new Set());
  const [leadStatus, setLeadStatus] = useState(new Set());
  const [search, setSearch] = useState("");
  const handleDatePickerDateChange = (selDate: any) => {
    setDateRangeStart(selDate.from);
    setDateRangeEnd(selDate.to);
  };

  const handleCampaignSelectorDateChange = (selCampagin: any) => {
    setLeadcampaign(selCampagin);
  };

  const handleStatusSelectorDateChange = (selNurture: any) => {
    setLeadStatus(selNurture);
  };

  return (
    <>
      <form
        action={searchLeadHistory}
        className="flex w-full flex-col items-center justify-start gap-3 lg:flex-row"
      >
        <Input
          placeholder="Filter Email..."
          name="filter_email"
          className="h-10 w-full lg:w-[300px]"
        />

        <CampaginFilter
          {...(searchParams && { searchParams: searchParams })}
          sendDataToParent={(selCampagin: any) => {
            handleCampaignSelectorDateChange(selCampagin);
          }}
        />
        <StatusFilter
          {...(searchParams && { searchParams: searchParams })}
          sendDataToParent={(selStatus: any) => {
            handleStatusSelectorDateChange(selStatus);
          }}
        />
        <CalendarDateRangePicker
          {...(searchParams && { searchParams: searchParams })}
          sendDataToParent={(str: any) => {
            handleDatePickerDateChange(str);
          }}
        />

        <input
          type="hidden"
          name="filter_date_range_start"
          value={dateRangeStart ? dateRangeStart.toISOString() : ""}
        />
        <input
          type="hidden"
          name="filter_date_range_end"
          value={dateRangeEnd ? dateRangeEnd.toISOString() : ""}
        />
        <input
          type="hidden"
          name="filter_lead_campaign"
          value={Array.from(leadcampagin).join(",")}
        />
        <input
          type="hidden"
          name="filter_lead_status"
          value={Array.from(leadStatus).join(",")}
        />
        <input
          type="hidden"
          name="item_per_page"
          value={searchParams?.item_per_page || "10"}
        />
        <Button type="submit">Search</Button>
      </form>
    </>
  );
}
