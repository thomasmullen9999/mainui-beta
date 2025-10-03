const fs = require("fs");
const path = require("path");
import { parse } from "json2csv";
import { NextApiResponse } from "next";
import { NextResponse, NextRequest } from "next/server";
import {
  nurtureMorrisons,
  nurtureSainsburys,
  nurtureBolt,
  nurtureAsda,
  nurtureCoop,
  nurtureNext,
  nurtureJusteat,
} from "./actions";
import { auth } from "@/auth";

export async function GET(req: NextRequest, res: NextApiResponse) {
  const session = await auth();
  const campaign = req.nextUrl.searchParams.get("campaign");

  if (!campaign)
    return NextResponse.json({ msg: "Unauthorised" }, { status: 400 });

  if (session) {
    try {
      let data;
      switch (campaign) {
        case "bolt":
          data = await nurtureBolt();
          break;
        case "sainsburys":
          data = await nurtureSainsburys();
          break;
        case "morrisons":
          data = await nurtureMorrisons();
          break;
        case "asda":
          data = await nurtureAsda();
          break;
        case "coop":
          data = await nurtureCoop();
          break;
        case "next":
          data = await nurtureNext();
          break;
        case "justeat":
          data = await nurtureJusteat();
          break;
      }

      if (!data) {
        return NextResponse.json({ msg: "No Records" }, { status: 400 });
      }
      if (data.length == 0) {
        return NextResponse.json({ msg: "No Records" }, { status: 400 });
      }
      const csv = parse(data);

      const headers = new Headers();

      const dateTime = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const filename = `nurture_${campaign}${session?.user?.email}_${dateTime}.csv`;
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);

      return new NextResponse(csv, { status: 200, statusText: "OK", headers });
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  } else {
    return NextResponse.json({ msg: "Unauthorised" }, { status: 400 });
  }
}
