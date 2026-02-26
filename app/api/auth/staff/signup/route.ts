import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signUpSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { createSessionResponse } from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STAFF",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return createSessionResponse(user, 201);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong.", error },
      { status: 500 },
    );
  }
}
