import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalLeads = await prisma.lead.count();
    const contactedLeads = await prisma.lead.count({
      where: { contacted: true }
    });
    const totalMembers = await prisma.user.count();
    const totalBookings = await prisma.booking.count({
      where: { status: "CONFIRMED" }
    });

    // Fetch classes and occupancy
    const classes = await prisma.class.findMany({
      include: {
        bookings: {
          where: { status: "CONFIRMED" }
        }
      }
    });

    const classOccupancy = classes.map((c) => ({
      id: c.id,
      name: c.name,
      trainer: c.trainerName,
      maxCapacity: c.maxCapacity,
      currentBookings: c.bookings.length,
      occupancyRate: Math.round((c.bookings.length / c.maxCapacity) * 100)
    }));

    // Fetch recent leads
    const recentLeads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Fetch recent bookings
    const recentBookings = await prisma.booking.findMany({
      include: {
        user: true,
        class: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Aggregate monthly leads for the chart
    // In standard SQLite, we can just group in memory or query last 7 days.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLeads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { createdAt: "asc" }
    });

    // Format weekly leads for Recharts: { date: 'Mon', count: 5 }
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartDataMap = new Map<string, number>();

    // Initialise last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = weekdayNames[d.getDay()];
      chartDataMap.set(label, 0);
    }

    weeklyLeads.forEach((lead) => {
      const dayLabel = weekdayNames[new Date(lead.createdAt).getDay()];
      if (chartDataMap.has(dayLabel)) {
        chartDataMap.set(dayLabel, (chartDataMap.get(dayLabel) || 0) + 1);
      }
    });

    const leadChartData = Array.from(chartDataMap.entries()).map(([date, count]) => ({
      date,
      Leads: count
    }));

    return NextResponse.json({
      metrics: {
        totalLeads,
        contactedLeads,
        uncontactedLeads: totalLeads - contactedLeads,
        totalMembers,
        totalBookings
      },
      classOccupancy,
      recentLeads,
      recentBookings,
      leadChartData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
