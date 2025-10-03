import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, formData, lead_status, lead_email, lead_name, lead_campaign } =
      body;

    if (!id) {
      return NextResponse.json(
        { message: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Check if lead exists
    const existingLead = await prisma.leadHistory.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { message: "Lead not found - cannot update non-existent lead" },
        { status: 404 }
      );
    }

    // 🚫 Prevent updating if lead is already sold
    if (existingLead.lead_sold_timestamp) {
      return NextResponse.json({
        success: false,
        lead_id: existingLead.id,
        message: "Lead is already sold and cannot be updated",
      });
    }

    let newStatus = lead_status || existingLead.lead_status || "nurture";

    // 🚫 Prevent downgrading SOLD → NURTURE
    if (
      existingLead.lead_status?.toLowerCase() === "sold" &&
      newStatus.toLowerCase() !== "sold"
    ) {
      console.warn(
        `Attempted to downgrade SOLD lead ${id} to ${newStatus}. Keeping as SOLD.`
      );
      newStatus = existingLead.lead_status; // keep SOLD
    }

    const updatedLead = await prisma.leadHistory.update({
      where: { id },
      data: {
        formData,
        lead_status: newStatus,
        lead_email,
        lead_name,
        lead_campaign,
      },
    });

    return NextResponse.json({
      success: true,
      lead_id: updatedLead.id,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
