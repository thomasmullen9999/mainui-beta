import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add the second argument to GET with params destructured
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead_id = params.id;

  if (!lead_id) {
    return NextResponse.json({ message: "Invalid lead ID" }, { status: 400 });
  }

  try {
    const lead = await prisma.leadHistory.findFirst({
      where: {
        OR: [
          { id: lead_id }, // Search by `id`
          { lead_id: lead_id }, // Fallback to search by `lead_id`
        ],
      },
    });

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
