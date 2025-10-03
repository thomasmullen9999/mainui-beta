import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { title } = await req.json();

  await prisma.post.create({
    data: { title },
  });

  return NextResponse.json({ message: "Created Todo" }, { status: 200 });
}
