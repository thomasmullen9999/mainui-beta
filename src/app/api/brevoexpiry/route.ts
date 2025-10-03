import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadHistory } from "@prisma/client";
export const revalidate = 0; //disable cache
type BrevoLead = {
  id: string;
  lead_email: string;
  campaign: string;
  daysuntilexpiry: number;
};
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function batch_update_fields_brevo(updateQueue: any) {
  var url = "https://api.brevo.com/v3/contacts/batch";
  const batchSize = 5;

  const payload = {
    contacts: updateQueue,
  };
  const resultArr = [];

  for (let i = 0; i < Math.ceil(updateQueue.length / batchSize); i++) {
    const batch = updateQueue.slice(i * batchSize, (i + 1) * batchSize);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY || "",
        },
        body: JSON.stringify({
          contacts: batch,
        }),
      });
      const result = await response;
      resultArr.push({
        batch: i + 1,
        status: result.status,
        message: result,
      });
      if (i < Math.ceil(updateQueue.length / batchSize) - 1) {
        await delay(500);
      }
    } catch (error) {
      console.error(`Batch batch_update_fields_brevo ${i + 1} failed:`, error);
    }
  }

  return resultArr;
}
export async function GET(req: NextRequest) {
  const leads: BrevoLead[] = await prisma.$queryRaw`
    SELECT 
      lh.id,
      lh.lead_email,
      lh.lead_status,
      lh.lead_campaign AS campaign,
      "formData"->'dateleft'->'value' AS dateleft,
           DATE_PART(
            'day',
            (
                ("formData"->'dateleft'->>'value')::date + 
                (CASE 
                  WHEN lh.lead_campaign = 'morrisons' THEN INTERVAL '161 days'
                  WHEN lh.lead_campaign = 'justeat' THEN INTERVAL '70 days'
                  WHEN lh.lead_campaign = 'asda' THEN INTERVAL '2002 days'
                  WHEN lh.lead_campaign = 'bolt' THEN INTERVAL '70 days'
                  WHEN lh.lead_campaign = 'coop' THEN INTERVAL '161 days'
                  WHEN lh.lead_campaign = 'next' THEN INTERVAL '161 days'
                  WHEN lh.lead_campaign = 'sainsburys' THEN INTERVAL '161 days'
                  ELSE INTERVAL '0 days'
                END)
            ) - CURRENT_DATE
        ) AS daysuntilexpiry
      
    FROM "LeadHistory" lh
		WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
      AND ("formData"->'dateleft'->>'value') != ''
      AND lh.lead_email != ''
      AND lh.lead_status IN ('nurture')
      AND lh.lead_campaign IN ('coop', 'morrisons', 'asda', 'coop', 'next', 'sainsburys')
  `;

  const validLeads = leads.filter((lead) => lead.daysuntilexpiry >= -1000);

  const updateQueue = validLeads.map((lead) => ({
    email: lead.lead_email,
    attributes: { EXPIRES_IN_DAYS: lead.daysuntilexpiry },
  }));

  const emailCount = new Map();

  updateQueue.forEach(({ email }) => {
    emailCount.set(email, (emailCount.get(email) || 0) + 1);
  });

  const filteredQueue = updateQueue.filter(
    ({ email }) => emailCount.get(email) === 1
  );

  if (updateQueue.length === 0) {
    return NextResponse.json({
      success: false,
      leads: validLeads,
      message: "No valid leads to update",
    });
  }
  const testupdateQueue = [
    {
      email: validLeads[0].lead_email,
      attributes: { EXPIRES_IN_DAYS: validLeads[0].daysuntilexpiry },
    },
  ];
  const brevo_response = await batch_update_fields_brevo(filteredQueue);
  return NextResponse.json({
    success: true,
    test: JSON.stringify(brevo_response),
    //pl: JSON.stringify(filteredQueue),
    finish: true,
  });
}
