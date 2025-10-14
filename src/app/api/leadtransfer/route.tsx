import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma, PrismaClient, LeadHistory, LeadStatus } from "@prisma/client";
import configDataJustEat from "@/app/p/data/justeat.json";
import configDataSainsburys from "@/app/p/data/sainsburys.json";
import configDataMorrisons from "@/app/p/data/morrisons.json";
import configDataAsda from "@/app/p/data/asda.json";
import configDataCoop from "@/app/p/data/coop.json";
import configDataNext from "@/app/p/data/next.json";
import configDataBolt from "@/app/p/data/bolt.json";
import {
  calculateDayDistances,
  calculateAge,
  getLondonTime,
} from "@/utils/main";
import crypto from "crypto";

const CONFIG_MAP = {
  justeat: configDataJustEat,
  sainsburys: configDataSainsburys,
  morrisons: configDataMorrisons,
  asda: configDataAsda,
  coop: configDataCoop,
  next: configDataNext,
  bolt: configDataBolt,
};

// --- Safe getter helper ---
function safeValue(obj: any, key: string, fallback: any = "") {
  return obj?.[key]?.value ?? fallback;
}

function validationFunction(data: LeadHistory): boolean {
  if (!data.lead_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.lead_email)) {
    return false;
  }

  const configData =
    CONFIG_MAP[data.lead_campaign as keyof typeof CONFIG_MAP] ||
    configDataJustEat;
  const apiCallsHistory: any[] = [];
  const { formData } = data;

  for (const item of configData) {
    for (const field of item.fields) {
      if (
        field.condition?.includes("calculateDayDistances") ||
        field.condition?.includes("calculateAge")
      ) {
        const executeCode = new Function(
          "field",
          "formData",
          "calculateDayDistances",
          "calculateAge",
          `return ${field.condition}`
        );

        if (
          !executeCode(field, formData, calculateDayDistances, calculateAge)
        ) {
          apiCallsHistory.push({
            label: "CONDITIONAL CHECK",
            value: `FAILED CHECK: return ${field.condition}`,
            timestamp: new Date().toISOString(),
          });
          updateApiCallsHistory(data.id, data.apiCallsHistory, apiCallsHistory);
          return false;
        }
      }

      if (item.pathcondition) {
        for (const condition of item.pathcondition) {
          if (
            condition.headingTo.includes("Sorry") &&
            field.label !== "address"
          ) {
            const dynamicFunc = new Function(
              "field",
              "formData",
              "calculateDayDistances",
              "calculateAge",
              `return !(${condition.if_condition})`
            );

            if (
              !dynamicFunc(field, formData, calculateDayDistances, calculateAge)
            ) {
              apiCallsHistory.push({
                label: "PATHCONDITIONAL CHECK",
                value: `FAILED CHECK: return !(${condition.if_condition})`,
                timestamp: new Date().toISOString(),
              });
              updateApiCallsHistory(
                data.id,
                data.apiCallsHistory,
                apiCallsHistory
              );
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

async function updateApiCallsHistory(
  leadId: string,
  apiCallsHistory: any[],
  newApiCallsHistory: any[]
): Promise<void> {
  try {
    await prisma.leadHistory.update({
      where: { id: leadId },
      data: { apiCallsHistory: [...newApiCallsHistory, ...apiCallsHistory] },
    });
  } catch (error) {
    console.error("Error updating apiCallsHistory:", error);
  }
}

function toLeadByteCampaignNurture(campaign: string): string {
  const campaignMap: Record<string, string> = {
    sainsburys: "SAINS-NUR",
    morrisons: "FP4A",
    asda: "ASDA-NUR",
    coop: "COOP-NUR",
    next: "NEXT-NUR",
    bolt: "BOLT-NUR",
  };
  return campaignMap[campaign] || `${campaign.toUpperCase()}-NUR`;
}

function toLeadByteCampaignBillable(campaign: string, formData: any): string {
  const campaignMap: Record<string, string> = {
    sainsburys: "SAINS-BIL",
    morrisons: "FPFA--WL-BILL",
    coop: "COOP-BILL",
    next: "NEXT--BILL",
    bolt: "BOLT-BILL",
  };

  if (campaign === "asda") {
    const currentDate = new Date();
    const formDate = new Date(safeValue(formData, "dateleft"));
    const monthsDifference =
      (currentDate.getFullYear() - formDate.getFullYear()) * 12 +
      (currentDate.getMonth() - formDate.getMonth());

    return monthsDifference > 6 &&
      safeValue(formData, "still_work_at_store") !== "Yes"
      ? "ASDA-CIV"
      : "ASDA-BIL";
  }

  return campaignMap[campaign] || `${campaign.toUpperCase()}-BIL`;
}

async function server_marketing_tracking(formData: any, ip_address: string) {
  try {
    const ttObject = {
      event: "SubmitForm",
      event_time: Date.now(),
      user: {
        email: [
          crypto
            .createHash("sha256")
            .update(safeValue(formData, "email").trim().toLowerCase())
            .digest("hex"),
        ],
        phone: [
          crypto
            .createHash("sha256")
            .update(
              "+44" +
                (safeValue(formData, "telphone") || "")
                  .replace(/\s/g, "")
                  .trim()
                  .slice(-10)
                  .toLowerCase()
            )
            .digest("hex"),
        ],
        ttp: safeValue(formData, "ttp"),
        ttclid: safeValue(formData, "ttclid"),
        ip: ip_address,
        user_agent: safeValue(formData, "user_agent"),
      },
      page: {
        url: safeValue(formData, "page_url"),
        referrer: safeValue(formData, "referrer"),
      },
    };

    const res = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Access-Token": process.env.TIKTOKEVENTAPI_TOKEN!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_source: "web",
          event_source_id: "CIR8LE3C77UAB9CECI10",
          data: [ttObject],
        }),
      }
    );

    const data = await res.json();
    console.log("tt res", data);
    return data;
  } catch (error) {
    console.log("tracking error", error);
    return {};
  }
}

function generateBitlyId(length = 5): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function isBitlyIdUnique(
  prisma: PrismaClient,
  bitlyId: string
): Promise<boolean> {
  const count = await prisma.leadHistory.count({
    where: { lead_id: bitlyId },
  });
  return count === 0;
}

// --- Employment validation helper ---
function isEmploymentStatusValid(formData: any): boolean {
  if (safeValue(formData, "campaign") === "justeat") {
    return true; // Ignore conditions for justeat
  }

  const stillWork = safeValue(formData, "still_work_at_store");
  const dateLeft = safeValue(formData, "dateleft");

  return (
    (stillWork === "Yes" && (!dateLeft || dateLeft === "")) ||
    (stillWork === "No" && dateLeft && dateLeft !== "")
  );
}

export async function GET(req: NextRequest) {
  const lead_id = req.nextUrl.searchParams.get("lead_id");
  const lead_campaign = req.nextUrl.searchParams.get("lead_campaign");

  if (!lead_id) {
    return NextResponse.json({ msg: "Lead ID Not Found" }, { status: 400 });
  }

  const data = await prisma.leadHistory.findFirst({
    where: {
      OR: [
        { id: lead_id, lead_campaign: lead_campaign },
        { lead_id: lead_id, lead_campaign: lead_campaign },
      ],
    },
  });

  if (!data) {
    return NextResponse.json({ msg: "Data Not Found" }, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req: Request) {
  console.log("🔥 [PUT] /api/leadtransfer called");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Invalid JSON payload:", err);
    return NextResponse.json(
      { success: false, msg: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { formData, lead_id } = body || {};
  if (!formData || !lead_id) {
    console.error("❌ Missing formData or lead_id", { formData, lead_id });
    return NextResponse.json(
      { success: false, msg: "Missing formData or lead_id" },
      { status: 400 }
    );
  }

  console.log("📦 lead_id:", lead_id);
  const date = new Date();

  let checkdata;
  try {
    if (String(lead_id).length === 5) {
      checkdata = await prisma.leadHistory.findFirst({ where: { lead_id } });
    } else {
      checkdata = await prisma.leadHistory.findUnique({
        where: { id: lead_id },
      });
    }
  } catch (err) {
    console.error("❌ Prisma lookup error:", err);
    return NextResponse.json(
      { success: false, msg: "Database lookup failed" },
      { status: 500 }
    );
  }

  if (!checkdata) {
    console.warn("⚠️ No record found for", lead_id);
    return NextResponse.json(
      { success: false, msg: "Lead not found" },
      { status: 404 }
    );
  }

  console.log("✅ Found lead:", {
    id: checkdata.id,
    campaign: checkdata.lead_campaign,
    status: checkdata.lead_status,
  });

  if (checkdata.lead_status !== LeadStatus.nurture) {
    console.warn("⚠️ Lead not in nurture state, skipping update");
    return NextResponse.json(
      { success: false, msg: "Lead is not in nurture state" },
      { status: 400 }
    );
  }

  // --- Validation ---
  const validData = validationFunction({ ...checkdata, formData });
  if (!validData) {
    console.warn("⚠️ Validation failed for lead:", lead_id);
    return NextResponse.json(
      { success: false, msg: "Invalid lead data" },
      { status: 400 }
    );
  }

  if (!isEmploymentStatusValid(formData)) {
    console.warn("⚠️ Employment status invalid for", lead_id);
    return NextResponse.json(
      {
        success: false,
        msg: "Employment status and date left are inconsistent",
      },
      { status: 400 }
    );
  }

  console.log("🧩 Validation passed, preparing new formData...");

  const newFormData: any = { ...formData };

  // update derived fields
  newFormData.lead_sold_timestamp = {
    label: "Lead Sold Timestamp",
    value: getLondonTime(),
  };
  newFormData.lb_campaign = {
    label: "Leadbyte Campaign",
    value: toLeadByteCampaignBillable(
      safeValue(formData, "campaign"),
      formData
    ),
  };
  newFormData.lb_accepted_dba = { label: "Accepted DBA", value: "Yes" };
  newFormData.lead_status = { label: "Lead Status", value: "sold" };
  newFormData.latest_step = { label: "Latest Step", value: "Completed" };

  console.log("📤 Updating lead directly via Prisma...");

  try {
    const updatedLead = await prisma.leadHistory.update({
      where: { id: checkdata.id }, // use the actual DB primary key
      data: {
        lead_status: "sold",
        formData: newFormData,
        lead_sold_timestamp: date,
        lead_sold_timestamp_txt: newFormData.lead_sold_timestamp.value,
      },
    });

    console.log("✅ Lead successfully updated:", updatedLead.id);

    // Continue with your tracking
    await server_marketing_tracking(
      formData,
      req.headers.get("x-real-ip") || "127.0.0.1"
    );

    return NextResponse.json(
      { success: true, msg: "Lead successfully updated to sold" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🔥 Error updating lead:", err);
    return NextResponse.json(
      { success: false, msg: err.message || "Lead update failed" },
      { status: 500 }
    );
  }
}

function extractStreet1(address: string | undefined): string {
  if (!address) return "";
  const parts = address.split(",").map((s) => s.trim());
  return parts[0] || "";
}

export async function POST(req: Request) {
  try {
    const { formData } = await req.json();
    const date = new Date();

    formData.timestamp = `${date.getFullYear()}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} - ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    formData.lead_sold_timestamp = {
      label: "Lead Sold Timestamp",
      value: "",
    };

    let bitlyId;
    do {
      bitlyId = generateBitlyId();
    } while (!(await isBitlyIdUnique(prisma, bitlyId)));

    if (safeValue(formData, "campaign") !== "sainsburys") {
      if (!formData.latest_step) formData.latest_step = {};
      formData.latest_step.value = "Final Step";
    }

    const newlead = await prisma.leadHistory.create({
      data: {
        lead_email: safeValue(formData, "email"),
        lead_name: safeValue(formData, "firstname"),
        lead_campaign: safeValue(formData, "campaign"),
        formData: formData,
        lead_status: LeadStatus.nurture,
        lead_id: bitlyId,
      },
    });

    formData.lb_campaign = {
      label: "Leadbyte Campaign",
      value: toLeadByteCampaignNurture(safeValue(formData, "campaign")),
    };

    const nurtureLinkId = newlead.lead_id;
    const campaignChar = safeValue(formData, "campaign").charAt(0) ?? "";
    const nurtureLinkCode = `https://claim.fairpayforall.co.uk/${campaignChar}/${nurtureLinkId}`;

    formData.uuid = newlead.id;
    formData.nurture_id = {
      label: "Nurture ID",
      value: newlead.id,
    };

    if (!isEmploymentStatusValid(formData)) {
      return NextResponse.json(
        {
          success: false,
          message: "Employment status and date left are inconsistent",
        },
        { status: 400 }
      );
    }

    const nurtureCampaignNames = {
      sainsburys: "SAINS-NUR",
      next: "NEXT-NUR",
      morrisons: "FP4A",
      asda: "ASDA-NUR",
      coop: "COOP-NUR",
      bolt: "BOLT-NUR",
      justeat: "JUSTEAT-NUR",
    };

    type CampaignKey = keyof typeof nurtureCampaignNames;

    const campid =
      nurtureCampaignNames[formData.campaign.value as CampaignKey] ||
      "TEST-NUR";

    let sainsLeadbyteJson = {};

    if (safeValue(formData, "campaign") === "sainsburys") {
      const leadbytePayload = {
        campid: "SAINS-API",
        sid: "3",
        email: safeValue(formData, "email"),
        firstname: safeValue(formData, "firstname"),
        lastname: safeValue(formData, "lastname"),
        dob: safeValue(formData, "dob"),
        full_address: safeValue(formData, "address"),
        phone1: safeValue(formData, "telphone"),
        gender: safeValue(formData, "gender"),
        still_work_at_store: safeValue(formData, "still_work_at_store"),
        accepted_dba: safeValue(formData, "accepted_dba"),
        hourlyrate: safeValue(formData, "hourly_rate"),
        storelocation: safeValue(formData, "storelocation"),
        postcode: safeValue(formData, "postcode"),
        utm_source: safeValue(formData, "utm_source"),
        utm_medium: safeValue(formData, "utm_medium"),
        utm_device: safeValue(formData, "utm_device"),
        employee_number: safeValue(formData, "employee_number"),
        marketing: safeValue(formData, "futuremarketing"),
        ninumber: safeValue(formData, "ninumber"),
        dateleft: safeValue(formData, "dateleft"),
        utm_content: safeValue(formData, "utm_content"),
        privacypolicy: safeValue(formData, "privacypolicy", "Yes"),
        utm_campaign: safeValue(formData, "utm_campaign"),
        utm_term: safeValue(formData, "utm_term"),
        nurture_id: safeValue(formData, "nurture_id"),
        device: safeValue(formData, "device"),
        nurture_link: nurtureLinkCode,
        expiry_date: safeValue(formData, "expiry_date"),
        days_left: safeValue(formData, "days_left"),
        latest_step: safeValue(formData, "latest_step"),
        country: "United Kingdom",
      };

      const leadbyteResponse = await fetch(
        "https://maddisonclarke.leadbyte.co.uk/restapi/v1.3/leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            X_KEY: process.env.LEADBYTE_API_KEY!,
          },
          body: JSON.stringify(leadbytePayload),
        }
      );

      sainsLeadbyteJson = await leadbyteResponse.json();
      console.log(sainsLeadbyteJson, "beta one");

      if (!leadbyteResponse.ok) {
        console.error("Leadbyte error:", sainsLeadbyteJson);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to push lead to Leadbyte (Sainsburys)",
          },
          { status: 500 }
        );
      }
    }

    let leadbyteJson = {};

    const fv = (key: string) => formData?.[key]?.value ?? "";

    const addressValue = fv("address");
    const street1Value = fv("street1") || extractStreet1(addressValue);

    const leadbytePayload = {
      campid: campid ?? "",
      sid: "3",

      // 🔹 Core info
      email: fv("email"),
      firstname: fv("firstname"),
      lastname: fv("lastname"),
      dob: fv("dob"),
      gender: fv("gender"),

      // 🔹 Contact / address info
      phone1: fv("telphone"),
      full_address: addressValue,
      street1: addressValue,
      street2: fv("street2"),
      towncity: fv("towncity"),
      county: fv("county"),
      postcode: fv("postcode"),
      country: fv("country") || "United Kingdom",

      // 🔹 Work info
      storelocation: fv("storelocation"),
      still_work_at_store: fv("still_work_at_store"),
      accepted_dba: fv("accepted_dba"),
      hourlyrate: fv("hourly_rate"),
      employee_number: fv("employee_number"),
      ninumber: fv("ninumber"),
      dateleft: fv("dateleft"),

      // 🔹 UTM / marketing info
      utm_source: fv("utm_source"),
      utm_medium: fv("utm_medium"),
      utm_device: fv("utm_device"),
      utm_content: fv("utm_content"),
      utm_campaign: fv("utm_campaign"),
      utm_term: fv("utm_term"),
      marketing: fv("futuremarketing"),
      privacypolicy: fv("privacypolicy") || "Yes",

      // 🔹 Device / tracking info
      nurture_id: fv("nurture_id"),
      device: fv("device"),
      nurture_link:
        fv("nurture_link") ||
        `https://claim.fairpayforall.co.uk/${formData?.campaign?.value?.charAt(0)?.toLowerCase() ?? ""}/${nurtureLinkId}`,

      // 🔹 Timing / expiry
      expiry_date: fv("expiry_date"),
      days_left: fv("days_left"),
      latest_step: fv("latest_step"),
    };

    const leadbyteResponse = await fetch(
      "https://maddisonclarke.leadbyte.co.uk/restapi/v1.3/leads",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          X_KEY: process.env.LEADBYTE_API_KEY!,
        },
        body: JSON.stringify(leadbytePayload),
      }
    );

    leadbyteJson = await leadbyteResponse.json();

    console.log(leadbyteJson, "leadbyte");

    if (!leadbyteResponse.ok) {
      console.error("Leadbyte error:", leadbyteJson);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to push lead to Leadbyte",
        },
        { status: 500 }
      );
    }

    await prisma.leadHistory.update({
      where: { id: newlead.id },
      data: {
        jsonData: leadbyteJson,
        lead_status: newlead.lead_status ?? LeadStatus.nurture,
      },
    });

    revalidatePath("/admin");

    // ✅ FIXED: Return success property that frontend expects
    return NextResponse.json(
      {
        success: true,
        message: "Lead successfully transferred",
        lead_id: newlead.id,
        leadbyte_status: (leadbyteJson as any).status ?? null,
        leadbyte: leadbyteJson,
        sainsLeadbyte: sainsLeadbyteJson,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 POST /leadtransfer error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to transfer lead",
      },
      { status: 500 }
    );
  }
}
