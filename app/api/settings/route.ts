import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { NextResponse } from "next/server";

export async function GET() {
  await ensureSeeded();
  const dbSettings = await prisma.setting.findMany();
  
  // Convert list of settings to key-value object
  const settings: Record<string, string> = {};
  dbSettings.forEach((item) => {
    settings[item.id] = item.value;
  });

  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Update multiple settings
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.setting.upsert({
          where: { id: key },
          update: { value },
          create: { id: key, value }
        });
      } else if (typeof value === "object") {
        await prisma.setting.upsert({
          where: { id: key },
          update: { value: JSON.stringify(value) },
          create: { id: key, value: JSON.stringify(value) }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
