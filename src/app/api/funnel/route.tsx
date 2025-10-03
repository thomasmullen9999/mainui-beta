import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { postcode } = await req.json();

  if (typeof postcode !== "string" || postcode.length === 0) {
    throw new Error("That can't be a postcode");
  }

  const response = await fetch(
    `https://ws.postcoder.com/pcw/${process.env.POSTCODER_APIKEY}/address/UK/${postcode}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const json = await response.json();

  return NextResponse.json(json, { status: 200 });
}
