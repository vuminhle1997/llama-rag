import prisma from '@/lib/prisma';
import { NextResponse, type NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const user = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });
  if (user) {
    return NextResponse.json({ user });
  }
};
