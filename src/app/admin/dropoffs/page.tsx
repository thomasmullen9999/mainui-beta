import { prisma } from "@/lib/prisma";
import {
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationContent,
  Pagination,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { LeadInspect } from "../components/LeadInspect";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SearchBox } from "@/app/admin/components/searchbox";
import PaginationDropdown from "../components/PaginationDropdown";
import { ClickToCopy } from "@/app/admin/components/clicktocopy";
import { NextRequest } from "next/server";
import StepsBarChart from "@/app/admin/components/stepsbarchart";
import { DropoffDatePicker } from "@/app/admin/components/dropoffdatepicker";
export default async function Admin(
  {
    searchParams,
  }: {
    searchParams?: { [key: string]: string | string[] | undefined };
  },
  req: any
) {
  const {
    filter_email,
    filter_campaign,
    filter_status,
    filter_date_range_start,
    filter_date_range_end,
    filter_lead_campaign,
    filter_lead_status,
    page,
    item_per_page,
  } = searchParams || {};

  const filter: any = {};

  if (filter_email) {
    filter.OR = [
      {
        lead_email: {
          contains: filter_email,
          mode: "insensitive",
        },
      },
      {
        id: filter_email,
      },
    ];
  }

  if (filter_campaign) {
    filter.lead_campaign = {
      contains: filter_campaign,
      mode: "insensitive",
    };
  }

  if (filter_status) {
    filter.lead_status = {
      contains: filter_status,
      mode: "insensitive",
    };
  }

  if (filter_date_range_start || filter_date_range_end) {
    filter.createdAt = {};
  }

  if (filter_date_range_start && filter_date_range_end) {
    filter.createdAt = {
      gte: filter_date_range_start,
      lte: filter_date_range_end,
    };
  }

  if (filter_date_range_start || filter_date_range_end) {
    filter.createdAt = {};
  }

  if (filter_date_range_start) {
    filter.createdAt.gte = filter_date_range_start;
  }

  if (filter_date_range_end) {
    filter.createdAt.lte = filter_date_range_end;
  }

  if (filter_lead_campaign) {
    filter.lead_campaign = {};
    filter.lead_campaign.in = (filter_lead_campaign as string).split(",");
  }

  if (filter_lead_status) {
    filter.lead_status = {};
    filter.lead_status.in = (filter_lead_status as string).split(",");
  }

  let currentPage: number;
  interface Props {
    searchParams: { itemsPerPage?: string | string[] };
  }

  if (searchParams && typeof searchParams.page === "string") {
    currentPage = parseInt(searchParams.page!) || 1;
  } else {
    currentPage = 1;
  }

  const generateUrl = (currentPage: number) => {
    const queryString = new URLSearchParams({
      ...(filter_email && { filter_email }),
      ...(filter_lead_campaign && { filter_lead_campaign }),
      ...(filter_lead_status && { filter_lead_status }),
      ...(filter_date_range_start && { filter_date_range_start }),
      ...(filter_date_range_end && { filter_date_range_end }),
      page: currentPage.toString(),
      item_per_page: itemsPerPage.toString(),
    } as Record<string, string>).toString();

    return `/admin/dropoffs?${queryString}`;
  };

  const itemsPerPage: number =
    !isNaN(Number(item_per_page)) && item_per_page ? Number(item_per_page) : 10;
  const totalCount = await prisma.droppedLead.count({ where: filter });
  let totalPages = Math.ceil(totalCount / itemsPerPage);

  const droppedLeads = await prisma.droppedLead.findMany({
    where: filter,

    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      lead_email: true,
      lead_sold_timestamp_txt: true,
      createdAt: true,
      lead_status: true,
      lead_campaign: true,
      formData: true,
      lead_name: true,
      apiData: true,
    },
  });

  const latestStepsArr: any[] = [];
  const prevStepsArr: any[] = [];
  droppedLeads.forEach((lead: any) => {
    latestStepsArr.push(
      `${lead.formData["latest_step"]?.value} - ${lead.formData["campaign"]?.value}`
    );
    if (lead?.formData["latest_step"]?.value.includes("Sorry")) {
      prevStepsArr.push(
        `${lead?.formData["step_before_latest"]?.value} - ${lead.formData["campaign"]?.value}`
      );
    }
  });

  return (
    <div className="bg-white">
      <div className="mb-2">
        <h2 className="text-xl font-bold">Leads</h2>
        <PaginationDropdown initialItemsPerPage={itemsPerPage} />
      </div>

      <Card className="w-auto">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <SearchBox searchParams={searchParams} />
            </div>
          </div>
        </CardContent>
      </Card>

      <h1 className="mb-4 mt-10 text-2xl font-bold">Dropoff Distribution</h1>
      <DropoffDatePicker />

      <StepsBarChart arr1={latestStepsArr} arr2={prevStepsArr} />

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>CreatedAt</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Dropped Off</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>

              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {droppedLeads.map((lead: any) => {
              return (
                <TableRow>
                  <TableCell className="px-4 py-0">
                    {lead.createdAt.toString()}
                  </TableCell>
                  <TableCell className="px-4 py-0 text-right">
                    <Badge
                      variant={
                        lead?.lead_status === "sold" ? "sold" : "secondary"
                      }
                    >
                      {lead?.lead_campaign} - {lead?.lead_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-0">
                    {JSON.stringify(
                      lead.formData["latest_step"]?.value || {},
                      null,
                      2
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    {lead.lead_email} ({lead.id})
                  </TableCell>
                  <TableCell className="px-4 py-0">{lead.lead_name}</TableCell>

                  <TableCell className="px-4 py-0">
                    {" "}
                    <LeadInspect lead={lead} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end px-6 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  currentPage - 1 === 0
                    ? generateUrl(currentPage)
                    : generateUrl(currentPage - 1)
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <PaginationItem>
                    <PaginationLink
                      href={generateUrl(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                pageNumber === currentPage - 3 ||
                pageNumber === currentPage + 3
              ) {
                return (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href={
                  currentPage + 1 > totalPages
                    ? generateUrl(currentPage)
                    : generateUrl(currentPage + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
