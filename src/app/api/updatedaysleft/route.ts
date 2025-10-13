export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to calculate days left
function daysLeft(targetDateStr: string) {
  const targetDate = new Date(targetDateStr);
  const today = new Date();

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Type definition for formData
type FormData = {
  [key: string]: { value: any } | undefined;
  days_left?: { value: number; [key: string]: any };
};

// Type for lead updates
type LeadUpdate = {
  dbId: string;
  leadbyteId: string;
  newDaysLeft: number;
  formData: FormData;
};

// Utility function to safely update days_left.value
function updateDaysLeft(formData: FormData, newDaysLeft: number): FormData {
  return {
    ...formData, // preserve all existing fields
    days_left: {
      ...(formData.days_left || {}), // preserve subfields
      value: newDaysLeft, // only update value
    },
  };
}

export async function GET() {
  const debugLogs: string[] = [];

  try {
    const apiKey = process.env.LEADBYTE_API_KEY;
    if (!apiKey) {
      debugLogs.push("Missing LeadByte API key");
      return NextResponse.json(
        { error: "Missing LeadByte API key", debugLogs },
        { status: 500 }
      );
    }

    const allLeads = await prisma.leadHistory.findMany();
    debugLogs.push(`Total leads fetched from DB: ${allLeads.length}`);

    const leadsToUpdate: LeadUpdate[] = allLeads
      .map((lead) => {
        const formData = lead.formData as FormData | undefined;

        if (!formData || typeof formData !== "object") {
          debugLogs.push(
            `Skipping lead ${lead.id}: invalid or missing formData`
          );
          return null;
        }

        const leadbyteId = formData["leadbyte_id"]?.value;
        const expiryDate = formData["expiry_date"]?.value;

        if (!leadbyteId || !expiryDate) {
          debugLogs.push(
            `Skipping lead ${lead.id}: missing leadbyte_id or expiry_date`
          );
          return null;
        }

        const newDaysLeft = daysLeft(expiryDate);
        debugLogs.push(
          `Lead ${lead.id} -> leadbyteId: ${leadbyteId}, expiryDate: ${expiryDate}, daysLeft: ${newDaysLeft}`
        );

        return {
          dbId: lead.id,
          leadbyteId,
          newDaysLeft,
          formData,
        };
      })
      .filter((lead): lead is LeadUpdate => lead !== null);

    debugLogs.push(`Leads to update after filtering: ${leadsToUpdate.length}`);

    if (leadsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No leads to update",
        leadsToUpdate: [],
        debugLogs,
      });
    }

    // 1. Update local DB safely
    for (const lead of leadsToUpdate) {
      debugLogs.push(
        `Updating DB for lead ${lead.dbId} with daysLeft ${lead.newDaysLeft}`
      );
      await prisma.leadHistory.update({
        where: { id: lead.dbId },
        data: {
          formData: updateDaysLeft(lead.formData, lead.newDaysLeft),
        },
      });
    }

    // Separate expired leads
    const expiredLeads = leadsToUpdate.filter((lead) => lead.newDaysLeft < 0);
    debugLogs.push(`Expired leads: ${expiredLeads.length}`);

    // 2. Update LeadByte — one request per lead
    const leadbyteResponses = await Promise.all(
      leadsToUpdate.map(async (lead) => {
        try {
          const res = await fetch(
            "https://maddisonclarke.leadbyte.com/restapi/v1.3/leads",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                apikey: apiKey,
              },
              body: JSON.stringify({
                key: apiKey,
                leads: [
                  {
                    id: lead.leadbyteId,
                    update: { days_left: lead.newDaysLeft },
                  },
                ],
              }),
            }
          );
          const json = await res.json();
          debugLogs.push(
            `LeadByte updated lead ${lead.leadbyteId}: ${JSON.stringify(json)}`
          );
          return {
            leadId: lead.leadbyteId,
            status: res.status,
            response: json,
          };
        } catch (err) {
          debugLogs.push(
            `LeadByte update failed for lead ${lead.leadbyteId}: ${String(err)}`
          );
          return {
            leadId: lead.leadbyteId,
            status: 500,
            response: { error: "Request failed", details: String(err) },
          };
        }
      })
    );

    // 3. Suppression API call for expired leads
    let suppressionResponses: any[] = [];
    if (expiredLeads.length > 0) {
      suppressionResponses = await Promise.all(
        expiredLeads.map(async (lead) => {
          try {
            const res = await fetch(
              "https://maddisonclarke.leadbyte.co.uk/restapi/v1.3/deliveries/trigger",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  apikey: apiKey,
                },
                body: JSON.stringify({
                  key: apiKey,
                  deliveryId: 198,
                  leadId: lead.leadbyteId,
                }),
              }
            );
            const json = await res.json();
            debugLogs.push(
              `Suppression triggered for lead ${lead.leadbyteId}: ${JSON.stringify(json)}`
            );
            return {
              leadId: lead.leadbyteId,
              status: res.status,
              response: json,
            };
          } catch (err) {
            debugLogs.push(
              `Suppression failed for lead ${lead.leadbyteId}: ${String(err)}`
            );
            return {
              leadId: lead.leadbyteId,
              status: 500,
              response: {
                error: "Suppression call failed",
                details: String(err),
              },
            };
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      updatedLeadsCount: leadsToUpdate.length,
      leadsToUpdate,
      leadbyteResponses,
      suppressionResponses,
      debugLogs, // <-- all debug logs visible in browser
    });
  } catch (err) {
    debugLogs.push(`Days left update failed: ${String(err)}`);
    return NextResponse.json(
      { error: "Days left update failed", debugLogs },
      { status: 500 }
    );
  }
}
