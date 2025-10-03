import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { lead_id } = body;

    if (!lead_id) {
      return NextResponse.json({ error: "Missing lead_id" }, { status: 400 });
    }

    console.log(lead_id, "in the new one");

    // Update leadHistory status from "nurture" → "sold"
    const updatedLead = await prisma.leadHistory.updateMany({
      where: {
        lead_id: lead_id,
        lead_status: "nurture", // only update if it's still nurture
      },
      data: {
        lead_status: "sold",
      },
    });

    console.log(updatedLead, "updated?");

    if (updatedLead.count === 0) {
      return NextResponse.json(
        { error: "Lead not found or already marked as sold" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Lead status updated to sold",
      lead_id,
    });
  } catch (error) {
    console.error("Error updating lead to sold:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
