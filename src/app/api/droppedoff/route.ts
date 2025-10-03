// src/app/api/droppedoff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust this path to where your Prisma client is

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // check if lead already exists, if so update in prisma with new formData and latest_step
    const existingLead = await prisma.leadHistory.findUnique({
      where: { id: data.id },
    });

    console.log(existingLead, "existingLead");

    if (existingLead) {
      // update leadHistory with latest step
      await prisma.leadHistory.update({
        where: { id: existingLead.id },
        data: {
          formData: data.formData,
        },
      });

      await prisma.droppedLead.update({
        where: { id: existingLead.id },
        data: {
          formData: data.formData,
        },
      });
    }

    console.log(data, "droppi");

    const newDroppedLead = await prisma.droppedLead.create({
      data: {
        lead_email: data.lead_email,
        lead_name: data.lead_name,
        lead_campaign: data.lead_campaign,
        formData: data.formData,
        lead_status: "new",
      },
    });

    return NextResponse.json({ success: true, id: newDroppedLead.id });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
