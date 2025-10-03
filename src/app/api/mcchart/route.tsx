import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
const prisma = new PrismaClient();

// Define a type for the formatted data
interface FormattedData {
  date: string;
  [key: string]: number | string;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ msg: "Unauthorised" }, { status: 400 });
  }
  try {
    const leadData = await prisma.$queryRaw<FormattedData[]>`
      SELECT
        DATE(lead_sold_timestamp) as date,
        lead_campaign,
        COUNT(*)::text as count  
      FROM "LeadHistory"
      WHERE lead_status in ('sold')
      GROUP BY DATE(lead_sold_timestamp), lead_campaign
      ORDER BY DATE(lead_sold_timestamp) ASC
    `;

    // Process the raw data to ensure each date entry includes all campaigns
    const campaignSet = new Set<string>();
    leadData.forEach((item) => {
      if (item.lead_campaign) {
        campaignSet.add(item.lead_campaign + "");
      }
    });

    const campaigns = Array.from(campaignSet);
    const formattedData: Record<string, FormattedData> = {};

    // Format the data
    leadData.forEach((item) => {
      const { date, lead_campaign, count } = item;

      if (!formattedData[date]) {
        formattedData[date] = { date };
        campaigns.forEach((campaign) => {
          formattedData[date][`lead_campaign_${campaign}`] = 0; // Initialize to 0
        });
      }

      const campaignKey = `lead_campaign_${lead_campaign}`;
      formattedData[date][campaignKey] = count;
    });

    // Ensure every date entry has all campaign keys
    Object.keys(formattedData).forEach((date) => {
      campaigns.forEach((campaign) => {
        const campaignKey = `lead_campaign_${campaign}`;
        if (!(campaignKey in formattedData[date])) {
          formattedData[date][campaignKey] = 0;
        }
      });
    });

    const chartData = Object.values(formattedData);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching lead data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
