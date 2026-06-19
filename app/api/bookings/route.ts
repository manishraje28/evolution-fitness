import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        class: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, email, classId } = body;

    if (!phone || !name || !classId) {
      return NextResponse.json({ error: "Name, phone, and classId are required" }, { status: 400 });
    }

    // 1. Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name,
          email: email || null
        }
      });
      
      // Create empty profile
      await prisma.memberProfile.create({
        data: {
          userId: user.id
        }
      });
    }

    // 2. Check if class exists and cap
    const gymClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        bookings: {
          where: { status: "CONFIRMED" }
        }
      }
    });

    if (!gymClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (gymClass.bookings.length >= gymClass.maxCapacity) {
      return NextResponse.json({ error: "Class is fully booked" }, { status: 400 });
    }

    // 3. Check if user already booked
    const existing = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        classId: classId,
        status: "CONFIRMED"
      }
    });

    if (existing) {
      return NextResponse.json({ error: "You have already booked this class" }, { status: 400 });
    }

    // 4. Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        classId: classId
      },
      include: {
        class: true
      }
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
