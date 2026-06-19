import { getAICoachResponse } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, name } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message are required" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || "Guest Athlete"
        }
      });
      await prisma.memberProfile.create({
        data: {
          userId: user.id,
          fitnessGoal: "General Fitness",
          weightKg: 70,
          heightCm: 170
        }
      });
    }

    const reply = await getAICoachResponse(phone, message);
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
