import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (session) {
    try {
      const lead_id = req.nextUrl.searchParams.get("lead_id");
      if (!lead_id) {
        return NextResponse.json({ msg: "Lead ID Not Found" }, { status: 400 });
      }

      const data = await prisma.leadHistory.findFirst({
        where: {
          OR: [
            { id: lead_id }, // Search by `id`
            { lead_id: lead_id }, // Fallback to search by `lead_id`
          ],
        },
      });

      if (!data) {
        return NextResponse.json({ msg: "Data Not Found" }, { status: 400 });
      }

      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error("Error getting lead:", error);
    }
  } else {
    return NextResponse.json({ msg: "Unauthorised" }, { status: 400 });
  }
}
