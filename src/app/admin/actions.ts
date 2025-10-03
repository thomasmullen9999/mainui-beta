"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import {
  fromCookie,
  setSessionCookie,
  isAlreadySet,
} from "@/app/helpers/worker";
import { redirect } from "next/navigation";

interface Query {
  filter_email?: string | null;
  filter_campaign?: string | null;
  filter_status?: string | null;
  // Add more fields if needed
}

async function countLeadByCampaign() {
  try {
    const leadHistories = await prisma.leadHistory.groupBy({
      by: ["lead_campaign"],
      _count: true,
    });

    const facets = new Map();
    leadHistories.forEach((leadHistory) => {
      facets.set(leadHistory.lead_campaign, String(leadHistory._count));
    });

    return facets;
  } catch (error) {
    console.error(error);
    return new Map();
  }
}

async function countLeadByStatus() {
  try {
    const leadHistories = await prisma.leadHistory.groupBy({
      by: ["lead_status"],
      _count: true,
    });

    const facets = new Map();
    leadHistories.forEach((leadHistory) => {
      facets.set(leadHistory.lead_status, String(leadHistory._count));
    });

    return facets;
  } catch (error) {
    console.error(error);
    return new Map();
  }
}

async function searchLeadHistory(formData: FormData) {
  "use server";

  const rawFormData = {
    filter_email: formData.get("filter_email"),
    //filter_campaign: formData.get("filter_campaign"),
    filter_date_range_start: formData.get("filter_date_range_start"),
    filter_date_range_end: formData.get("filter_date_range_end"),
    filter_lead_campaign: formData.get("filter_lead_campaign"),
    filter_lead_status: formData.get("filter_lead_status"),
    item_per_page: formData.get("item_per_page"),
  };
  console.log("search started");
  console.log(rawFormData);

  revalidatePath("/admin");
  const query: Query = {};

  formData.forEach((value, key) => {
    if (typeof value === "string" && key in query) {
      query[key as keyof Query] = value;
    }
  });
  const queryString = new URLSearchParams({
    filter_email: rawFormData.filter_email,
    filter_lead_campaign: rawFormData.filter_lead_campaign,
    filter_lead_status: rawFormData.filter_lead_status,
    filter_date_range_start: rawFormData.filter_date_range_start,
    filter_date_range_end: rawFormData.filter_date_range_end,
    item_per_page: rawFormData.item_per_page,
  } as Record<string, string>).toString();

  redirect(`/admin/?${queryString}`);
}

async function searchDroppedLeads(formData: FormData) {
  "use server";

  const rawFormData = {
    filter_email: formData.get("filter_email"),
    //filter_campaign: formData.get("filter_campaign"),
    filter_date_range_start: formData.get("filter_date_range_start"),
    filter_date_range_end: formData.get("filter_date_range_end"),
    filter_lead_campaign: formData.get("filter_lead_campaign"),
    filter_lead_status: formData.get("filter_lead_status"),
    item_per_page: formData.get("item_per_page"),
  };
  console.log("search started");
  console.log(rawFormData);

  revalidatePath("/admin");
  const query: Query = {};

  formData.forEach((value, key) => {
    if (typeof value === "string" && key in query) {
      query[key as keyof Query] = value;
    }
  });
  const queryString = new URLSearchParams({
    filter_email: rawFormData.filter_email,
    filter_lead_campaign: rawFormData.filter_lead_campaign,
    filter_lead_status: rawFormData.filter_lead_status,
    filter_date_range_start: rawFormData.filter_date_range_start,
    filter_date_range_end: rawFormData.filter_date_range_end,
    item_per_page: rawFormData.item_per_page,
  } as Record<string, string>).toString();

  redirect(`/admin/dropoffs?${queryString}`);
}
async function updateItemPerPage(params: string, newItemPerPage: number) {
  const pageParams = new URLSearchParams(params);
  pageParams.set("item_per_page", newItemPerPage.toString());

  const updatedQueryString = pageParams.toString();

  // Return the updated query string or redirect as needed
  redirect(`/admin/?${updatedQueryString}`);
}

export {
  searchLeadHistory,
  countLeadByCampaign,
  countLeadByStatus,
  updateItemPerPage,
  searchDroppedLeads,
};
