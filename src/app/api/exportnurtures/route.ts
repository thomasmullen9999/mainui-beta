// app/api/exportnurtures/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaign = searchParams.get("campaign");

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign name is required" },
      { status: 400 }
    );
  }

  try {
    const data = await prisma.leadHistory.findMany({
      where: {
        lead_campaign: campaign,
        lead_status: "nurture",
      },
    });

    if (!data.length) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${campaign}_nurture.csv`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
