// app/api/assign-lead-ids/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHAR_SET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 5;
const MIGRATION_KEY = "assign-lead-ids-2024";

function generateRandomId(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
  }
  return result;
}

async function generateUniqueLeadId(): Promise<string> {
  let leadId: string;
  let exists: boolean;

  do {
    leadId = generateRandomId(ID_LENGTH);
    const existing = await prisma.leadHistory.findFirst({
      where: { lead_id: leadId },
      select: { id: true },
    });
    exists = !!existing;
  } while (exists);

  return leadId;
}

async function assignLeadIds() {
  const alreadyRan = await prisma.migrationLog.findUnique({
    where: { key: MIGRATION_KEY },
  });

  if (alreadyRan) {
    return { alreadyRan: true, updatedCount: 0 };
  }

  const items = await prisma.leadHistory.findMany({
    where: { lead_id: null },
  });

  for (const item of items) {
    const newLeadId = await generateUniqueLeadId();
    await prisma.leadHistory.update({
      where: { id: item.id },
      data: { lead_id: newLeadId },
    });
  }

  await prisma.migrationLog.create({
    data: { key: MIGRATION_KEY },
  });

  return { alreadyRan: false, updatedCount: items.length };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await assignLeadIds();
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to run migration" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
