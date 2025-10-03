"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScanEye } from "lucide-react";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import Link from "next/link";

type PropsArray = {
  lead: any;
};

export function LeadInspect({ lead }: PropsArray) {
  const [leadData, setLeadData] = useState(lead);

  const utm_keywords = ["utm", "ttp", "ttclid"];
  const browserinfo_keywords = [
    "server_country",
    "server_city",
    "server_region",
    "server_timezone",
    "server_zip_code",
    "referrer",
    "page_url",
  ];

  const preferredOrder = [
    "First Name",
    "Last Name",
    "Date of Birth",
    "Email",
    "Phone",
    "Date Left",
    "Gender",
    "Address",
    "Employee Number",
    "NI Number",
    "Future Marketing",
  ];

  const handleOpenChange = async (open: boolean) => {
    console.log("Dialog open state changed:", open);

    if (open) {
      try {
        const response = await fetch(`/api/getlead?lead_id=${lead.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setLeadData(data);
      } catch (error) {
        console.error("Error during API call:", error);
      }
    }
  };

  const getSortedFormData = () => {
    if (!leadData.formData) return [];

    const entries = Object.entries(leadData.formData) as [
      string,
      { label: string; value: string } | undefined,
    ][];

    // Preferred fields first
    const ordered = preferredOrder
      .map((label) => entries.find(([_, value]) => value?.label === label))
      .filter((entry): entry is [string, { label: string; value: string }] =>
        Boolean(entry?.[1])
      );

    // Remaining fields
    const remaining = entries.filter(
      ([_, value]) =>
        value &&
        value.label && // ensure label exists before calling includes
        !preferredOrder.includes(value.label) &&
        !utm_keywords
          .concat(browserinfo_keywords)
          .some((keyword) => value.label.includes(keyword))
    );

    return [...ordered, ...remaining];
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm">
          <ScanEye className="mr-2 h-4 w-4" />
          Inspect
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto lg:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Lead - {leadData.id}</DialogTitle>
          <DialogDescription>
            <Link
              href={`/api/getlead?lead_id=${leadData.id}&lead_campaign=${leadData.lead_campaign}`}
            >
              Open In New Tab
            </Link>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="tab1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tab1">General</TabsTrigger>
            <TabsTrigger value="tab2">Marketing</TabsTrigger>
            <TabsTrigger value="tab3">API/Webhooks</TabsTrigger>
            <TabsTrigger value="tab4">Browser Info</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent className="min-h-screen p-4" value="tab1">
            <div className="space-y-4">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950">
                  <TableRow>
                    <TableHead className="w-[150px]">Label</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableCaption className="text-sm text-muted-foreground">
                  Submitted at: {new Date(leadData.createdAt).toLocaleString()}
                </TableCaption>
                <TableBody>
                  {getSortedFormData().map(([key, value]) => {
                    const formDataEntry = value as {
                      label: string;
                      value: string;
                    };
                    if (!formDataEntry) return null;
                    return (
                      <TableRow
                        key={key}
                        className="transition-colors odd:bg-muted/50 hover:bg-muted/70"
                      >
                        <TableCell className="font-medium">
                          {formDataEntry.label}
                        </TableCell>
                        <TableCell className="text-right [word-break:break-word]">
                          {formDataEntry.value}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent className="min-h-screen p-4" value="tab2">
            <div className="space-y-4">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950">
                  <TableRow>
                    <TableHead className="w-[100px]">Label</TableHead>
                    <TableHead>Variable</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableCaption>
                  Submitted at: {new Date(leadData.createdAt).toISOString()}
                </TableCaption>
                <TableBody>
                  {leadData.formData &&
                    Object.entries(leadData.formData)
                      .filter(([key]) =>
                        utm_keywords.some((keyword) => key.includes(keyword))
                      )
                      .map(([key, value]) => {
                        const formDataEntry = value as {
                          label: string;
                          value: string;
                        };
                        if (!formDataEntry) return null;
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {formDataEntry.label}
                            </TableCell>
                            <TableCell>{key}</TableCell>
                            <TableCell className="text-right">
                              {formDataEntry.value}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* API/Webhooks Tab */}
          <TabsContent className="min-h-screen p-4" value="tab3">
            <div className="space-y-4">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950">
                  <TableRow>
                    <TableHead className="w-[100px]">Label</TableHead>
                    <TableHead>Variable</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableCaption>
                  Submitted at: {new Date(leadData.createdAt).toISOString()}
                </TableCaption>
                <TableBody>
                  {leadData.apiCallsHistory &&
                    leadData.apiCallsHistory.map(
                      (element: any, key: number) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">
                            {element.label}
                          </TableCell>
                          <TableCell>{element.timestamp}</TableCell>
                          <TableCell className="text-right [word-break:break-word]">
                            {element.value}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Browser Info Tab */}
          <TabsContent className="min-h-screen p-4" value="tab4">
            <div className="space-y-4">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950">
                  <TableRow>
                    <TableHead className="w-[100px]">Label</TableHead>
                    <TableHead>Variable</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableCaption>
                  Submitted at: {new Date(leadData.createdAt).toISOString()}
                </TableCaption>
                <TableBody>
                  {leadData.formData &&
                    Object.entries(leadData.formData)
                      .filter(([key]) =>
                        browserinfo_keywords.some((keyword) =>
                          key.includes(keyword)
                        )
                      )
                      .map(([key, value]) => {
                        const formDataEntry = value as {
                          label: string;
                          value: string;
                        };
                        if (!formDataEntry) return null;
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {formDataEntry.label}
                            </TableCell>
                            <TableCell>{key}</TableCell>
                            <TableCell className="text-right [word-break:break-word]">
                              {formDataEntry.value}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
