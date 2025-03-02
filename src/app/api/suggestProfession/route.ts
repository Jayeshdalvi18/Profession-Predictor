import OpenAI from "openai"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MAX_GUEST_PREDICTIONS = 3

export async function POST(req: Request) {
  try {
    const { hobbies, skills, education, workStyle, interests, languages, certifications, experience } = await req.json()

    // Check guest user prediction limit
    const cookieStore = await cookies()
    const guestId = cookieStore.get("guestId")?.value

    if (guestId) {
      await dbConnect()
      const guest = await GuestModel.findOne({ guestId })

      if (guest && guest.predictionsCount >= MAX_GUEST_PREDICTIONS) {
        return NextResponse.json(
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

    const prompt = `As a career counselor AI, analyze the following detailed profile to:
1. Estimate an IQ range based on the complexity of interests, skills, and education level
2. Suggest 3 most suitable professions that align with the profile
3. Provide detailed analysis for each suggestion including:
   - Skills match percentage
   - Growth potential
   - Work-life balance
   - Required additional skills or certifications
   - Salary range
   - Career progression path

Consider the following comprehensive profile:
Hobbies: ${hobbies}
Skills: ${skills}
Education: ${education}
Work Style Preference: ${workStyle}
Areas of Interest: ${interests}
Languages: ${languages || "Not specified"}
Certifications: ${certifications || "Not specified"}
Experience Level: ${experience || "Not specified"}

Provide a structured response with:
1. Estimated IQ range with explanation
2. Top 3 profession recommendations with detailed rationale
3. Comprehensive analysis for each profession including all the points mentioned above`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a career counseling AI that provides detailed career analysis and recommendations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    if (guestId) {
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
              languages,
              certifications,
              experience,
              result,
            },
          },
          $setOnInsert: { guestId: guestIdCookie },
          $set: { lastActive: new Date() },
        },
        { upsert: true, new: true },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

