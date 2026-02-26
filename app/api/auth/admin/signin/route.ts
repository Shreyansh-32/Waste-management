import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signInSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { createSessionResponse } from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 },
      );
    }

    return createSessionResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      200,
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong.", error },
      { status: 500 },
    );
  }
}
