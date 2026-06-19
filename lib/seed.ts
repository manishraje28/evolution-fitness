import { prisma } from "./db";

export async function ensureSeeded() {
  try {
    // 1. Seed Settings if empty
    const settingsCount = await prisma.setting.count();
    if (settingsCount === 0) {
      console.log("Seeding settings...");
      const defaultSettings = [
        { id: "gym_name", value: "Evolution Fitness Thane" },
        { id: "gym_phone", value: "+919769763350" },
        { id: "gym_address", value: "Vartak Nagar, Shree Vinayak Co.So. 5/38 M.H.B. Colony, Vartak Nagar Police Station Rd, near Vithhal Mandir, Thane, Maharashtra 400606" },
        { id: "google_rating", value: "4.7" },
        { id: "google_reviews_count", value: "110" },
        { id: "members_count", value: "1,200+" },
        { id: "years_active", value: "8+" },
        { id: "operating_hours", value: "Open · Closes 11 pm" },
        { id: "whatsapp_template_message", value: "Hi Evolution Fitness, I would like to book a Free Day Pass! Please let me know the details." },
        {
          id: "pricing_basic",
          value: JSON.stringify({
            name: "Basic Plan",
            price: "₹1,999",
            period: "month",
            features: [
              "Standard Gym Floor Access",
              "Standard Lockers & Showers",
              "1 Trainer Assistance Session",
              "Free Parking & Wi-Fi",
              "Floor Access: 6am - 10pm"
            ]
          })
        },
        {
          id: "pricing_pro",
          value: JSON.stringify({
            name: "Pro Plan",
            price: "₹3,499",
            period: "month",
            features: [
              "Unlimited Gym Floor Access",
              "Access to HIIT & CrossFit Classes",
              "2 Personal Training Sessions / Month",
              "Infrared Sauna Access (2 / Month)",
              "Customized Macro Strategy",
              "Floor Access: 5am - 11pm"
            ]
          })
        },
        {
          id: "pricing_elite",
          value: JSON.stringify({
            name: "Elite Plan",
            price: "₹5,999",
            period: "month",
            features: [
              "Full Sanctuary & Floor Access",
              "Unlimited Group & CrossFit Classes",
              "Dedicated Personal Trainer (8 sessions/month)",
              "Unlimited Sauna & Sports Therapy",
              "VO2 Max & Macro Tracking",
              "Private Locker & VIP Showers"
            ]
          })
        }
      ];

      for (const s of defaultSettings) {
        await prisma.setting.create({
          data: s
        });
      }
    }

    // 2. Seed Classes if empty
    const classesCount = await prisma.class.count();
    if (classesCount === 0) {
      console.log("Seeding classes...");
      const today = new Date();
      const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Helper to generate a date offset
      const getOffsetDate = (daysAhead: number, hours: number, minutes: number = 0) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + daysAhead);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      // Create a weekly schedule spanning 7 days (today to next 6 days)
      const sampleClasses = [];
      const trainers = ["Coach Rohan", "Coach Sneha", "Coach Vikram", "Coach Priya"];
      const classNames = ["CrossFit Strength", "HIIT Blast", "Strength & Hypertrophy", "Power Yoga & Recovery"];
      const difficulties = ["ADVANCED", "INTERMEDIATE", "ALL_LEVELS"];

      for (let day = 0; day < 7; day++) {
        // Morning class 1: 7:00 AM - 8:00 AM
        sampleClasses.push({
          name: classNames[day % classNames.length],
          trainerName: trainers[day % trainers.length],
          difficulty: difficulties[day % difficulties.length],
          maxCapacity: 15,
          startTime: getOffsetDate(day, 7),
          endTime: getOffsetDate(day, 8)
        });

        // Morning class 2: 9:00 AM - 10:00 AM
        sampleClasses.push({
          name: "HIIT Conditioning",
          trainerName: trainers[(day + 1) % trainers.length],
          difficulty: "ALL_LEVELS",
          maxCapacity: 20,
          startTime: getOffsetDate(day, 9),
          endTime: getOffsetDate(day, 10)
        });

        // Evening class 1: 6:00 PM - 7:00 PM
        sampleClasses.push({
          name: "CrossFit WOD",
          trainerName: trainers[(day + 2) % trainers.length],
          difficulty: "ADVANCED",
          maxCapacity: 12,
          startTime: getOffsetDate(day, 18),
          endTime: getOffsetDate(day, 19)
        });

        // Evening class 2: 7:30 PM - 8:30 PM
        sampleClasses.push({
          name: "Hypertrophy & Lift",
          trainerName: trainers[(day + 3) % trainers.length],
          difficulty: "INTERMEDIATE",
          maxCapacity: 15,
          startTime: getOffsetDate(day, 19, 30),
          endTime: getOffsetDate(day, 20, 30)
        });
      }

      for (const c of sampleClasses) {
        await prisma.class.create({
          data: c
        });
      }
    }
  } catch (error) {
    console.error("Error in seeding database:", error);
  }
}
