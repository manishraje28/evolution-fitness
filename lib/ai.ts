import { prisma } from "./db";

export async function getAICoachResponse(phone: string, message: string): Promise<string> {
  const cleanMessage = message.toLowerCase().trim();

  // 1. Fetch user context from database
  const user = await prisma.user.findUnique({
    where: { phone },
    include: { profile: true }
  });

  const userName = user?.name || "Athlete";
  const userGoal = user?.profile?.fitnessGoal || "General Conditioning";
  const userWeight = user?.profile?.weightKg || 75;
  const userHeight = user?.profile?.heightCm || 175;

  // 2. check if LLM key exists in env
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openAIKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the Head Coach at Evolution Fitness Thane. Your persona is aggressive, elite, high-performance, and industrial. You use a "No Bullshit" coaching style. Do not use generic corporate language. 
              The user profile is: Name: ${userName}, Goal: ${userGoal}, Weight: ${userWeight}kg, Height: ${userHeight}cm.
              Respond concisely in 2-3 sentences. Always end with an aggressive motivational sign-off like "EVOLVE OR REMAIN THE SAME!"`
            },
            { role: "user", content: message }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      console.error("OpenAI failed, using fallback:", e);
    }
  } else if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are the Head Coach at Evolution Fitness Thane. Your persona is aggressive, elite, high-performance, and industrial. You use a "No Bullshit" coaching style. Do not use generic corporate language. 
                  The user profile is: Name: ${userName}, Goal: ${userGoal}, Weight: ${userWeight}kg, Height: ${userHeight}cm.
                  Respond concisely in 2-3 sentences. Always end with an aggressive motivational sign-off like "EVOLVE OR REMAIN THE SAME!"
                  
                  User message: ${message}`
                }
              ]
            }
          ]
        })
      });
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error("Gemini failed, using fallback:", e);
    }
  }

  // 3. High-Fidelity Fallback Logic (if no API keys configured)
  if (cleanMessage.includes("hello") || cleanMessage.includes("hi") || cleanMessage.includes("hey")) {
    return `Welcome back to the grind, ${userName}. Your goal is set to "${userGoal}". What are we crushing today? Workouts, nutrition, or recovery? Let's get to work. EVOLVE OR REMAIN THE SAME!`;
  }

  if (cleanMessage.includes("workout") || cleanMessage.includes("routine") || cleanMessage.includes("exercise") || cleanMessage.includes("lift")) {
    if (userGoal.toLowerCase().includes("fat") || cleanMessage.includes("cardio") || cleanMessage.includes("hiit")) {
      return `For Fat Loss, we do high-intensity interval conditioning today. 
1. 500m Row buy-in.
2. 5 rounds of: 10 Thrusters, 15 Kettlebell swings, 20 Box Jumps.
3. Finish with 10 mins steep incline treadmill sprint.
Keep the rest periods under 45 seconds. EVOLVE OR REMAIN THE SAME!`;
    }
    return `For ${userGoal} (Strength & Hypertrophy Focus):
1. Barbell Squats: 4 sets x 6 reps (Heavy).
2. Romanian Deadlifts: 3 sets x 8 reps.
3. Weighted Dips: 3 sets to failure.
4. Hanging Leg Raises: 3 sets x 15 reps.
Push each working set to RPE 9. No excuses. EVOLVE OR REMAIN THE SAME!`;
  }

  if (cleanMessage.includes("macro") || cleanMessage.includes("diet") || cleanMessage.includes("eat") || cleanMessage.includes("protein")) {
    const protein = Math.round(userWeight * 2);
    const carbs = Math.round(userWeight * 2.5);
    const fats = Math.round(userWeight * 0.8);
    return `At ${userWeight}kg, your fuel intake targets are:
- Protein: ${protein}g (Build and repair)
- Carbs: ${carbs}g (Glycogen replenishment)
- Fats: ${fats}g (Hormonal health)
Cut the sugar, stop drinking liquid calories, and hit your protein target daily. EVOLVE OR REMAIN THE SAME!`;
  }

  if (cleanMessage.includes("sauna") || cleanMessage.includes("recovery") || cleanMessage.includes("sore") || cleanMessage.includes("stretch")) {
    return `Soreness is the price of admission, ${userName}. Hit the Infrared Sauna for 20 mins to boost blood flow, follow it with a cold shower, and drink 4 liters of water today. Recovery is where the muscle actually grows. EVOLVE OR REMAIN THE SAME!`;
  }

  if (cleanMessage.includes("book") || cleanMessage.includes("class")) {
    return `To book your slot in today's CrossFit or HIIT class, just click the "Book Now" buttons on our website schedule, or send your phone number and preferred class here and I'll queue it. EVOLVE OR REMAIN THE SAME!`;
  }

  return `I hear you, ${userName}. But listening won't build muscle. Tell me: do you need a workout routine, macro recommendations for your ${userWeight}kg frame, or recovery advice for your training cycle? EVOLVE OR REMAIN THE SAME!`;
}
