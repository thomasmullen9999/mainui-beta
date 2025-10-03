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

import { LeadInspect } from "./components/LeadInspect";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SearchBox } from "@/app/admin/components/searchbox";
import { trimDateString } from "@/utils/main";
import PaginationDropdown from "./components/PaginationDropdown";
import { ClickToCopy } from "@/app/admin/components/clicktocopy";
import CopyLinkButton from "@/components/copyLinkButton";
export default async function Admin({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
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
    filter.lead_email = {
      contains: filter_email,
      mode: "insensitive",
    };
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

    return `/admin?${queryString}`;
  };

  const itemsPerPage: number =
    !isNaN(Number(item_per_page)) && item_per_page ? Number(item_per_page) : 10;

  const totalCount = await prisma.leadHistory.count({ where: filter });
  let totalPages = Math.ceil(totalCount / itemsPerPage);

  const leadhistorys = await prisma.leadHistory.findMany({
    where: filter,
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,

    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      lead_id: true,
      lead_email: true,
      lead_phone: true,
      lead_sold_timestamp_txt: true,
      createdAt: true,
      lead_status: true,
      lead_campaign: true,
      jsonData: true,
      lead_name: true,
      formData: true,
    },
  });

  // works for morrisons, asda, coop only, rest need testing

  return (
    <div className="bg-white">
      <div className="mb-2">
        <h2 className="text-xl font-bold">Lead(s)</h2>
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

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>Campaign - Status</TableHead>
              <TableHead>Nurture Created At</TableHead>
              <TableHead>Sold Time</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Step Reached</TableHead>
              <TableHead>Get Link</TableHead>
              <TableHead>Name</TableHead>

              {/* <TableHead>Respond</TableHead> */}
              <TableHead>Inspect</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leadhistorys.map((lead) => {
              return (
                <TableRow>
                  <TableCell className="px-4 py-0">
                    <Badge
                      className={
                        lead?.lead_status === "sold" &&
                        lead?.lead_campaign === "morrisons"
                          ? "bg-yellow-500 text-white"
                          : lead?.lead_status === "sold" &&
                              lead?.lead_campaign === "asda"
                            ? "bg-green-500"
                            : lead?.lead_status === "sold" &&
                                lead?.lead_campaign === "coop"
                              ? "bg-blue-500 text-white"
                              : lead?.lead_status === "sold" &&
                                  lead?.lead_campaign === "sainsburys"
                                ? "bg-red-500 text-white"
                                : lead?.lead_status === "sold" &&
                                    lead?.lead_campaign === "bolt"
                                  ? "bg-black text-white"
                                  : lead?.lead_status === "sold" &&
                                      lead?.lead_campaign === "justeat"
                                    ? "bg-orange-500 text-white"
                                    : lead?.lead_status === "sold" &&
                                        lead?.lead_campaign === "next"
                                      ? "bg-gray-700 text-white"
                                      : lead?.lead_campaign === "coop"
                                        ? "bg-blue-300 text-white"
                                        : lead?.lead_campaign === "bolt"
                                          ? "bg-gray-500 text-white"
                                          : lead?.lead_campaign === "morrisons"
                                            ? "bg-yellow-200 text-white"
                                            : lead?.lead_campaign ===
                                                "sainsburys"
                                              ? "bg-red-300 text-white"
                                              : lead?.lead_campaign ===
                                                  "justeat"
                                                ? "bg-orange-300 text-white"
                                                : lead?.lead_campaign === "asda"
                                                  ? "bg-green-300 text-white"
                                                  : "bg-gray-300"
                      }
                    >
                      {lead?.lead_campaign?.toUpperCase()} -{" "}
                      {lead?.lead_status?.toUpperCase()}{" "}
                      {lead?.lead_status?.toLowerCase() === "sold" && "✅"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-0">
                    {trimDateString(lead.createdAt.toString())}
                  </TableCell>
                  <TableCell className="px-4 py-0">
                    {lead.lead_sold_timestamp_txt}
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    {lead.lead_email}
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    {lead.lead_id}
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    {typeof lead.formData === "object" && lead.formData !== null
                      ? (lead.formData as any).telphone?.value
                      : null}
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    <h3>
                      {" "}
                      {typeof lead.formData === "object" &&
                      lead.formData !== null
                        ? (lead.formData as any).latest_step?.value
                        : null}
                    </h3>
                  </TableCell>
                  <TableCell className="px-4 py-0 font-medium">
                    <CopyLinkButton
                      leadId={lead.lead_id}
                      campaign={lead.lead_campaign ?? ""}
                    />
                  </TableCell>

                  <TableCell className="px-4 py-0">{lead.lead_name}</TableCell>

                  {/*                   <TableCell className="px-4 py-0">
                    {lead.jsonData && (
                      <ul>
                        {Object.entries(lead.jsonData).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell> */}
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
