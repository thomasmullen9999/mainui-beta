import { parse } from "json2csv";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Define types for formData structure
interface FormDataField {
  label: string;
  value: string | number | boolean | Array<any>;
}

interface DroppedLeads {
  id: string;
  formData: {
    dob?: FormDataField;
    ja4?: FormDataField;
    ttp?: FormDataField;
    info?: FormDataField;
    email?: FormDataField;
    gender?: FormDataField;
    ttclid?: FormDataField;
    address?: FormDataField;
    latest_step?: FormDataField;
    campaign?: FormDataField;
    multicar?: FormDataField;
    page_url?: FormDataField;
    postcode?: FormDataField;
    referrer?: FormDataField;
    telphone?: FormDataField;
    utm_term?: FormDataField;
    firstname?: FormDataField;
    lastname?: FormDataField;
    mainui_id?: FormDataField;
    otherfirm?: FormDataField;
    ip_address?: FormDataField;
    ukresident?: FormDataField;
    user_agent?: FormDataField;
    utm_medium?: FormDataField;
    utm_source?: FormDataField;
    server_city?: FormDataField;
    utm_content?: FormDataField;
    englandwales?: FormDataField;
    utm_campaign?: FormDataField;
    server_region?: FormDataField;
    server_country?: FormDataField;
    dpf_intellio_id?: FormDataField;
    futuremarketing?: FormDataField;
    jlr_intellio_id?: FormDataField;
    lpdateconfirmer?: FormDataField;
    server_timezone?: FormDataField;
    server_zip_code?: FormDataField;
    multicarconfirmer?: FormDataField;
  };
  // Other fields in droppedLeads
}

export async function GET(req: any) {
  const session = await auth();

  if (session) {
    try {
      const start =
        req.nextUrl.searchParams.get("filter_date_range_start") || "";
      const end = req.nextUrl.searchParams.get("filter_date_range_end") || "";

      // Conditionally set startDate and endDate if start and end are provided, otherwise leave as undefined
      const startDate = start ? new Date(start) : undefined;
      const endDate = end ? new Date(end) : undefined;

      // Fetch data from the database with optional date filter on createdAt
      const data = await prisma.droppedLead.findMany({
        where: {
          ...(startDate && endDate
            ? { createdAt: { gte: startDate, lte: endDate } }
            : {}),
        },
      });

      // Transform data to flatten formData fields into separate columns and remove formData
      const transformedData = data.map((item) => {
        const formData = item.formData as DroppedLeads["formData"]; // Cast formData to the correct type

        return {
          "MainUI ID": item.id, // include id or other relevant fields outside formData, if needed
          Latest_Step: formData?.latest_step?.value || "",
          Campaign: formData?.campaign?.value || "",
          "First Name": formData?.firstname?.value || "",
          "Last Name": formData?.lastname?.value || "",
          "Date of Birth": formData?.dob?.value || "",
          Gender: formData?.gender?.value || "",
          Phone: formData?.telphone?.value || "",
          Email: formData?.email?.value || "",
          Address: formData?.address?.value || "",
          Postcode: formData?.postcode?.value || "",

          "Vercel JA4": formData?.ja4?.value || "",
          "Tiktok TTP": formData?.ttp?.value || "",
          Info: formData?.info?.value || "",
          "Tiktok Click ID": formData?.ttclid?.value || "",
          Multicar: JSON.stringify(formData?.multicar?.value) || "", // Handle arrays as JSON strings

          Referrer: formData?.referrer?.value || "",
          "UTM Term": formData?.utm_term?.value || "",
          "Other Firm": formData?.otherfirm?.value || "",
          "UK Resident": formData?.ukresident?.value || "",
          "User Agent": formData?.user_agent?.value || "",
          "UTM Medium": formData?.utm_medium?.value || "",
          "UTM Source": formData?.utm_source?.value || "",
          "Server City": formData?.server_city?.value || "",
          "UTM Content": formData?.utm_content?.value || "",
          "Purchase in England/Wales": formData?.englandwales?.value || "",
          "UTM Campaign": formData?.utm_campaign?.value || "",
          "Server Region": formData?.server_region?.value || "",
          "Server Country": formData?.server_country?.value || "",
          Intellio_ID: formData?.dpf_intellio_id?.value || "",
          "Future Marketing": formData?.futuremarketing?.value || "",
          "JLR Intellio ID": formData?.jlr_intellio_id?.value || "",
          "LPDATE Confirmer": formData?.lpdateconfirmer?.value || "",
          "Server Time Zone": formData?.server_timezone?.value || "",
          "Server Zip Code": formData?.server_zip_code?.value || "",
          "Multicar Confirmer": formData?.multicarconfirmer?.value || "",
        };
      });

      // Convert transformed data to CSV
      const csv = parse(transformedData);

      // Generate a filename with timestamp
      const dateTime = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const filename = `mcform_${session?.user?.email}_${dateTime}.csv`;

      // Set headers to prompt file download
      const headers = new Headers();
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      headers.set("Content-Type", "text/csv");

      // Return response with CSV content
      return new NextResponse(csv, {
        status: 200,
        headers: headers,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      return new NextResponse(JSON.stringify({ msg: "Error exporting data" }), {
        status: 500,
      });
    }
  } else {
    return NextResponse.json({ msg: "Unauthorised" }, { status: 401 });
  }
}
