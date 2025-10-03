"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Lead {
  name: string;
  phone: string;
  address: string;
}
import { leadType, LeadsData } from "@/types/leadTypes";

const refreshlead = async (lead: LeadsData) => {
  console.log("refreshing");
  const leads = await prisma.lead.findMany();
  revalidatePath("/crm");
};

const createLead = async (lead: Lead) => {
  await prisma.lead.create({
    data: { name: lead.name, phone: lead.phone, address: lead.address },
  });

  revalidatePath("/crm");
};

export { refreshlead, createLead };
