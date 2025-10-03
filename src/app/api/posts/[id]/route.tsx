import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  const { title } = await req.json();

  await prisma.post.update({
    where: {
      id: parseInt(id),
    },
    data: {
      title: title,
    },
  });
  return NextResponse.json({ message: "Updated" }, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.post.delete({
    where: {
      id: parseInt(id),
    },
  });
  return NextResponse.json({ message: "Deleted Item" }, { status: 200 });
}
