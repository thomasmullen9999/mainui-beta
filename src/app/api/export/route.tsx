const fs = require("fs");
const path = require("path");
import { parse } from "json2csv";
import { NextApiResponse } from "next";
import { NextResponse, NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { PrismaClient, LeadHistory } from "@prisma/client";
export async function GET(req: NextRequest, res: NextApiResponse) {
  const session = await auth();

  // return NextResponse.json(
  //   { msg: `${session?.user?.email}` },
  //   { status: 200 }
  // );
  if (session) {
    try {
      const data = await prisma.leadHistory.findMany();

      const csv = parse(data);

      // Set headers to force download
      // res.setHeader(
      //   "Content-Disposition",
      //   'attachment; filename="dummy_data.csv"'
      // );
      // res.setHeader("Content-Type", "text/csv");

      const headers = new Headers();

      const dateTime = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const filename = `mcform_${session?.user?.email}_${dateTime}.csv`;
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);

      return new NextResponse(csv, { status: 200, statusText: "OK", headers });
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  } else {
    return NextResponse.json({ msg: "Unauthorised" }, { status: 400 });
  }
}
