"use client";
import React, { useState, useEffect } from "react";
import { CalendarDateRangePicker } from "@/app/admin/components/date-range-picker";
import { CampaginFilter } from "@/app/admin/components/campaignfilter";
import { Input } from "@/components/ui/input";
import { searchDroppedLeads } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { addDays, format, endOfDay, subMonths } from "date-fns";

export function DropoffDatePicker({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [dateRangeStart, setDateRangeStart] = useState(
    subMonths(new Date(), 3)
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date());
  const [leadcampaign, setLeadcampaign] = useState(new Set());
  const [leadStatus, setLeadStatus] = useState(new Set());

  const [search, setSearch] = useState("");
  const handleDatePickerDateChange = (selDate: any) => {
    setDateRangeStart(selDate.from);
    setDateRangeEnd(selDate.to);
  };

  const handleCampaignSelectorDateChange = (selCampaign: any) => {
    setLeadcampaign(selCampaign);
  };
  const handleStatusSelectorDateChange = (selStatus: any) => {
    setLeadStatus(selStatus);
  };
  return (
    <>
      <form
        action={searchDroppedLeads}
        className="flex w-full flex-col items-center justify-start gap-3 lg:flex-row"
      >
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
          value={Array.from(leadcampaign).join(",")}
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
        <Button
          onClick={() => {
            // Convert dates to ISO string if they exist
            const startDate = dateRangeStart
              ? dateRangeStart.toISOString()
              : "";
            const endDate = dateRangeEnd ? dateRangeEnd.toISOString() : "";

            // Construct URL with query parameters
            const exportUrl = `/api/dropoffs/export?filter_date_range_start=${startDate}&filter_date_range_end=${endDate}`;

            // Redirect to the constructed URL
            window.location.href = exportUrl;
          }}
        >
          Export
        </Button>
      </form>
    </>
  );
}
