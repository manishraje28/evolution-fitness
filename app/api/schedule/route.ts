import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { startTime: "asc" }
    });
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, trainerName, difficulty, maxCapacity, startTime, endTime } = body;

    if (!name || !trainerName || !maxCapacity || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required class fields" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        trainerName,
        difficulty: difficulty || "ALL_LEVELS",
        maxCapacity: parseInt(maxCapacity),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });

    return NextResponse.json(newClass);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
