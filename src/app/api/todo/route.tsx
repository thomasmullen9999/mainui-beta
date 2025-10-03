import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { title } = await req.json();

  if (typeof title !== "string" || title.length === 0) {
    throw new Error("That can't be a title");
  }
  await prisma.todo.create({
    data: { title, complete: false },
  });

  return NextResponse.json({ message: "Created Todo" }, { status: 200 });
}
