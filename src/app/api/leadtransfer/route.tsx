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

function firstCharLower(str: String) {
  if (!str) return ""; // handle empty or null strings
  return str.charAt(0).toLowerCase();
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
    const formDate = new Date(formData.dateleft.value);
    const monthsDifference =
      (currentDate.getFullYear() - formDate.getFullYear()) * 12 +
      (currentDate.getMonth() - formDate.getMonth());

    return monthsDifference > 6 && formData.still_work_at_store.value !== "Yes"
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
            .update(formData.email.value.trim().toLowerCase())
            .digest("hex"),
        ],
        phone: [
          crypto
            .createHash("sha256")
            .update(
              "+44" +
                formData.telphone.value
                  .replace(/\s/g, "")
                  .trim()
                  .slice(-10)
                  .toLowerCase()
            )
            .digest("hex"),
        ],
        ttp: formData.ttp.value,
        ttclid: formData.ttclid.value,
        ip: ip_address,
        user_agent: formData.user_agent.value,
      },
      page: {
        url: formData.page_url.value,
        referrer: formData.referrer.value,
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

function isValidWorkStatus(formData: any): boolean {
  const stillWork = formData.still_work_at_store?.value;
  const dateleft = formData.dateleft?.value;

  return (
    (stillWork === "Yes" && (!dateleft || dateleft.trim() === "")) ||
    (stillWork === "No" && dateleft && dateleft.trim() !== "")
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
  console.log(req, "got int");
  const { formData, lead_id } = await req.json();
  const date = new Date();

  console.log(formData, "formdata in put", lead_id, "lead id in put");

  let checkdata;

  if (String(lead_id).length === 5) {
    checkdata = await prisma.leadHistory.findFirst({
      where: { lead_id: lead_id },
    });
  } else {
    checkdata = await prisma.leadHistory.findUnique({
      where: { id: lead_id },
    });
  }

  if (!checkdata) {
    return NextResponse.json({ msg: "Data Not Found" }, { status: 400 });
  }

  if (checkdata.lead_status !== LeadStatus.nurture) {
    return NextResponse.json(
      { msg: "Lead is not in nurture" },
      { status: 400 }
    );
  }

  let newFormData: any = formData;

  if (!validationFunction({ ...checkdata, formData: newFormData })) {
    return NextResponse.json({ msg: "Invalid Data" }, { status: 400 });
  }

  if (formData.new_still_work_at_store) {
    newFormData.still_work_at_store.value =
      formData.new_still_work_at_store.value;
  }
  if (formData.new_dateleft) {
    newFormData.dateleft.value = formData.new_dateleft.value;
  }
  if (formData.new_LastDelivery) {
    newFormData.LastDelivery.value = formData.new_LastDelivery.value;
  }

  newFormData.lead_sold_timestamp = {
    label: "Lead Sold Timestamp",
    value: getLondonTime(),
  };

  newFormData.lb_campaign = {
    label: "Leadbyte Campaign",
    value: toLeadByteCampaignBillable(formData.campaign.value, formData),
  };

  newFormData.lb_accepted_dba = {
    label: "Accepted DBA",
    value: "Yes",
  };

  newFormData.lead_status = {
    label: "Lead Status",
    value: "sold",
  };

  newFormData.latest_step = {
    label: "Latest Step",
    value: "Completed",
  };

  // ✅ Only check rule if campaign !== justeat
  if (
    formData.campaign.value !== "justeat" &&
    !isValidWorkStatus(newFormData)
  ) {
    return NextResponse.json(
      { msg: "Invalid work status / dateleft combination" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(process.env.ZAPIER_LEADTRANSFER_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFormData),
    });

    if (!response.ok) {
      throw new Error(`Zapier API failed with status: ${response.status}`);
    }

    const json = await response.json();
    console.log("✅ Zapier call successful:", json);

    await server_marketing_tracking(
      formData,
      req.headers.get("x-real-ip") || "127.0.0.1"
    );
    console.log("✅ Marketing tracking completed");

    const updatedRecord = await prisma.leadHistory.update({
      where: { id: checkdata.id },
      data: {
        formData: newFormData ?? Prisma.JsonNull,
        lead_status: LeadStatus.sold,
        lead_sold_timestamp_txt: newFormData.lead_sold_timestamp.value,
        lead_sold_timestamp: date,
      },
    });

    const verification = await prisma.leadHistory.findUnique({
      where: { id: checkdata.id },
      select: { id: true, lead_status: true, lead_sold_timestamp: true },
    });
    await prisma.$disconnect();
    await prisma.$connect();

    const finalVerification = await prisma.leadHistory.findUnique({
      where: { id: checkdata.id },
      select: { id: true, lead_status: true },
    });

    return NextResponse.json({ msg: json.status }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { msg: `Operation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { formData } = await req.json();
  const date = new Date();

  formData.timestamp = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} - ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  formData.lead_sold_timestamp = {
    label: "Lead Sold Timestamp",
    value: "",
  };

  let bitlyId;
  do {
    bitlyId = generateBitlyId();
  } while (!(await isBitlyIdUnique(prisma, bitlyId)));

  if (formData.campaign.value !== "sainsburys") {
    formData.latest_step.value = "Final Step";
  }

  formData.nurture_link = {
    label: "Nurture Link",
    value: `https://claim.fairpayforall.co.uk/${firstCharLower(formData.campaign.value)}/${bitlyId}`,
  };

  const newlead = await prisma.leadHistory.create({
    data: {
      lead_email: formData.email.value,
      lead_name: formData.firstname.value,
      lead_campaign: formData.campaign.value,
      formData: formData,
      lead_status: LeadStatus.nurture,
      lead_id: bitlyId,
    },
  });

  formData.lb_campaign = {
    label: "Leadbyte Campaign",
    value: toLeadByteCampaignNurture(formData.campaign.value),
  };

  formData.uuid = newlead.id;
  formData.nurture_id = {
    label: "Nurture ID",
    value: newlead.id,
  };
  console.log(formData, "neenwnwnwnw");

  // ✅ Only check rule if campaign !== justeat
  if (formData.campaign.value !== "justeat" && !isValidWorkStatus(formData)) {
    return NextResponse.json(
      { msg: "Invalid work status / dateleft combination" },
      { status: 400 }
    );
  }

  const zapierResponse = await fetch(
    process.env.ZAPIER_LEADTRANSFER_ENDPOINT!,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }
  );

  if (!zapierResponse.ok) {
    throw new Error("Failed to push lead to Zapier");
  }

  const json = await zapierResponse.json();

  await prisma.leadHistory.update({
    where: { id: newlead.id },
    data: {
      jsonData: json,
      lead_status: newlead.lead_status ?? LeadStatus.nurture,
    },
  });

  revalidatePath("/admin");

  return NextResponse.json(
    {
      lead_id: newlead.id,
      msg: json.status,
    },
    { status: 200 }
  );
}
