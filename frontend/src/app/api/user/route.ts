export const dynamic = "force-static";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  const body: { username: string } = await req.json();
  const user = await prisma.user.create({
    data: {
      username: body.username,
    },
  });

  return Response.json({ user });
};
