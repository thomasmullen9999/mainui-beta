import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (typeof phone !== "string" || phone.length === 0) {
    throw new Error("That can't be a phone");
  }

  const sanitizedPhoneNumber = phone.replace(/\s/g, "").slice(-10);
  const response = await fetch(
    `https://api.datasoap.co.uk/?output=JSON&number=0044${sanitizedPhoneNumber}&type=HLR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DATASOAP_APIKEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const json = await response.json();

  return NextResponse.json(json, { status: 200 });
}
