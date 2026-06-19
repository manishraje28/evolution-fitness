import { getAICoachResponse } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { whatsappStore } from "@/lib/whatsappStore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || undefined;
  
  const logs = whatsappStore.getMessages(phone);
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, text, userName } = body;

    if (!phone || !text) {
      return NextResponse.json({ error: "Phone and text are required" }, { status: 400 });
    }

    // 1. Ensure user exists in database to support profile mapping
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: userName || "Athlete"
        }
      });
      // Initialize a default profile
      await prisma.memberProfile.create({
        data: {
          userId: user.id,
          fitnessGoal: "Muscle Gain",
          weightKg: 75,
          heightCm: 175
        }
      });
    }

    // 2. Add User Message to Store
    whatsappStore.addMessage(phone, "user", text);

    // 3. Generate AI Coach Response
    const responseText = await getAICoachResponse(phone, text);

    // 4. Add Coach Outgoing Message to Store
    const reply = whatsappStore.addMessage(phone, "coach", responseText);

    return NextResponse.json({
      success: true,
      reply
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
