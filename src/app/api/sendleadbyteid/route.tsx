// app/api/sendeleadbyteid/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // make sure you have a prisma client export here

// PUT /api/sendeleadbyteid
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { leadUUID, formData } = body;

    if (!leadUUID && !formData?.uuid?.value) {
      return NextResponse.json(
        { error: "leadUUID or formData.uuid.value is required" },
        { status: 400 }
      );
    }

    const updatedLead = await prisma.leadHistory.update({
      where: { id: leadUUID || formData.uuid?.value },
      data: { formData },
    });

    return NextResponse.json(updatedLead, { status: 200 });
  } catch (error: any) {
    console.error("Error updating leadHistory:", error);
    return NextResponse.json(
      { error: "Failed to update leadHistory" },
      { status: 500 }
    );
  }
}
