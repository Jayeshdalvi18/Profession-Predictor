import { OpenAI } from "openai"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MAX_GUEST_PREDICTIONS = 3

const prompt = `As a career counselor AI, analyze the following profile to:
1. Estimate an IQ range based on the complexity of interests, skills, and education level
2. Suggest 3 most suitable professions that align with the profile
3. Provide detailed analysis for each suggestion including:
   - Skills match percentage
   - Growth potential
   - Work-life balance
   - Required additional skills or certifications

Consider the following profile:
Hobbies: {hobbies}
Skills: {skills}
Education: {education}
Work Style Preference: {workStyle}
Areas of Interest: {interests}

Consider factors like:
- Analytical vs creative tendencies
- Technical vs social interests
- Leadership potential
- Problem-solving abilities
- Attention to detail
- Work style preferences
- Educational background
- Industry trends and future prospects

Provide a structured response with:
1. Estimated IQ range
2. Top 3 profession recommendations
3. Detailed analysis for each profession including match percentage and specific reasons for the recommendation`

export async function POST(req: Request) {
  try {
    const { hobbies, skills, education, workStyle, interests } = await req.json()

    // Validate input
    if (!hobbies || !skills || !education || !workStyle || !interests) {
      return Response.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check guest user prediction limit
    const cookieStore = await cookies()
    const guestId = cookieStore.get("guestId")?.value

    if (guestId) {
      await dbConnect()
      const guest = await GuestModel.findOne({ guestId })

      if (guest && guest.predictionsCount >= MAX_GUEST_PREDICTIONS) {
        return Response.json(
          {
            error: "Guest prediction limit reached. Please sign up for unlimited predictions.",
            limitReached: true,
          },
          { status: 403 },
        )
      }

      // Increment prediction count
      if (guest) {
        guest.predictionsCount += 1
        await guest.save()
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a career counseling AI that provides detailed career analysis and recommendations.",
        },
        {
          role: "user",
          content: prompt
            .replace("{hobbies}", hobbies)
            .replace("{skills}", skills)
            .replace("{education}", education)
            .replace("{workStyle}", workStyle)
            .replace("{interests}", interests),
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Failed to get response from AI")
    }

    // Parse IQ
    const iqMatch = content.match(/IQ.*?(\d+)/)
    const iq = iqMatch ? Number.parseInt(iqMatch[1]) : 100

    // Parse professions
    const professionsMatch = content.match(/Professions?:([\s\S]*?)(?=\n\n|$)/)
    const professions = professionsMatch
      ? professionsMatch[1]
          .split("\n")
          .filter((p) => p.trim())
          .map((p) => p.replace(/^\d+\.\s*/, "").trim())
      : []

    // Parse detailed analysis
    const details = content
      .split("\n\n")
      .filter((section) => section.includes("Match:"))
      .map((section) => {
        const title = section.split("\n")[0].trim()
        const matchPercentage = Number.parseInt(section.match(/Match:\s*(\d+)%/)?.[1] || "0")
        const description = section.split("\n").slice(1).join("\n").trim()
        return {
          title,
          match: matchPercentage,
          description,
        }
      })

    const result = {
      iq,
      professions,
      details,
    }

    // Store result for guest users
    let guestIdCookie = cookieStore.get("guestId")?.value

    if (!guestIdCookie) {
      guestIdCookie = nanoid()
      cookieStore.set("guestId", guestIdCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    await dbConnect()
    await GuestModel.findOneAndUpdate(
      { guestId: guestIdCookie },
      {
        $push: {
          predictions: {
            hobbies,
            skills,
            education,
            workStyle,
            interests,
            result,
          },
        },
        $setOnInsert: { guestId: guestIdCookie },
        $set: { lastActive: new Date() },
      },
      { upsert: true, new: true },
    )

    return Response.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to process request" }, { status: 500 })
  }
}

