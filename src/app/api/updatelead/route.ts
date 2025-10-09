import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  function parseAddress(address: string) {
    if (!address || address.trim() === "") {
      return {
        street1: "",
        towncity: "",
        county: "",
        postcode: "",
      };
    }

    // Split by commas and trim spaces
    const parts = address.split(",").map((p) => p.trim());

    // Extract based on typical UK format
    const street1 = parts[0] || "";
    const towncity = parts.length >= 4 ? parts[2] : parts[1] || "";
    const county = parts.length >= 4 ? parts[3] : parts[2] || "";
    const postcode = parts[parts.length - 1] || "";

    return { street1, towncity, county, postcode };
  }
  try {
    const body = await request.json();
    const {
      id,
      leadbyteId,
      formData,
      lead_status,
      lead_email,
      lead_name,
      lead_campaign,
      postcode,
    } = body;

    console.log(formData, "data 8989");
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

    // Prevent updating if lead is already sold
    if (existingLead.lead_sold_timestamp) {
      return NextResponse.json({
        success: false,
        lead_id: existingLead.id,
        message: "Lead is already sold and cannot be updated",
      });
    }

    let newStatus = lead_status || existingLead.lead_status || "nurture";

    // Prevent downgrading SOLD → NURTURE
    if (
      existingLead.lead_status?.toLowerCase() === "sold" &&
      newStatus.toLowerCase() !== "sold"
    ) {
      console.warn(
        `Attempted to downgrade SOLD lead ${id} to ${newStatus}. Keeping as SOLD.`
      );
      newStatus = existingLead.lead_status; // keep SOLD
    }

    // Update lead in database
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

    // --- LeadByte API call ---
    try {
      const apiKey = process.env.LEADBYTE_API_KEY;
      if (!apiKey) throw new Error("Missing LeadByte API key");

      const { street1, towncity, county, postcode } = parseAddress(
        formData.address.value
      );

      console.log(leadbyteId);

      const leadByteResponse = await fetch(
        "https://maddisonclarke.leadbyte.com/restapi/v1.3/leads",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey, // guaranteed string
          },
          body: JSON.stringify({
            key: apiKey,
            leads: [
              {
                // id: updatedLead.id.toString(),
                id: leadbyteId || formData.leadbyte_id.value,
                update: {
                  dob: formData.dob?.value ?? "",
                  gender: formData.gender?.value ?? "",
                  ninumber: formData.ni_number?.value ?? "",
                  employee_number: formData.employee_number?.value ?? "",
                  marketing: formData.futuremarketing?.value ?? "",
                  street1: street1 ?? "",
                  county: county ?? "",
                  towncity: towncity ?? "",
                  postcode: postcode ?? "",
                  accepted_dba: formData.accepted_dba?.value ?? "",
                  full_address: formData.address?.value ?? "",
                  latest_step: formData.latest_step.value ?? "",
                },
              },
            ],
          }),
        }
      );

      const leadByteResult = await leadByteResponse.json();
      console.log("LeadByte API result:", leadByteResult);
    } catch (apiError) {
      console.error("Error calling LeadByte API:", apiError);
    }

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
