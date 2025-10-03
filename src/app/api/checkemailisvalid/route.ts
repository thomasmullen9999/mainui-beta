import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, campaign } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    if (email.includes("@maddisonclarke.co.uk")) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      const duplicates = await prisma.leadHistory.count({
        where: { lead_email: email, lead_campaign: campaign },
      });
      return NextResponse.json({ success: duplicates == 0 }, { status: 200 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
