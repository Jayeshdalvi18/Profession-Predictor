import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { dbConnect } from "@/lib/dbConnect";
import GuestModel from "@/models/Guest.models";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const MAX_GUEST_PREDICTIONS = 3;

export async function POST(req: Request) {
  try {
    const { hobbies, skills, education, workStyle, interests, languages, certifications, experience } =
      await req.json();

    // Check guest user prediction limit
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value;

    if (guestId) {
      await dbConnect();
      const guest = await GuestModel.findOne({ guestId });

      if (guest && guest.predictionsCount >= MAX_GUEST_PREDICTIONS) {
        return NextResponse.json(
          {
            error: "Guest prediction limit reached. Please sign up for unlimited predictions.",
            limitReached: true,
          },
          { status: 403 }
        );
      }

      // Increment prediction count
      if (guest) {
        guest.predictionsCount += 1;
        await guest.save();
      }
    }

    const prompt = `As a career counselor AI, analyze the following profile:
1. Estimate an IQ range based on interests, skills, and education level.
2. Suggest the 3 most suitable professions.
3. Provide a detailed analysis for each, including:
   - Skills match percentage
   - Growth potential
   - Work-life balance
   - Additional skills needed
   - Salary range
   - Career progression

Profile:
- Hobbies: ${hobbies}
- Skills: ${skills}
- Education: ${education}
- Work Style: ${workStyle}
- Interests: ${interests}
- Languages: ${languages || "Not specified"}
- Certifications: ${certifications || "Not specified"}
- Experience: ${experience || "Not specified"}

Return a structured response with:
1. Estimated IQ range with reasoning.
2. Top 3 recommended professions.
3. Analysis for each profession.`

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Failed to get response from AI");
    }

    // Extract IQ estimate
    const iqMatch = text.match(/IQ.*?(\d+)/);
    const iq = iqMatch ? Number.parseInt(iqMatch[1]) : 100;

    // Extract professions
    const professionsMatch = text.match(/Professions?:([\s\S]*?)(?=\n\n|$)/);
    const professions = professionsMatch
      ? professionsMatch[1]
          .split("\n")
          .filter((p) => p.trim())
          .map((p) => p.replace(/^\d+\.\s*/, "").trim())
      : [];

    // Extract detailed analysis
    const details = text
      .split("\n\n")
      .filter((section) => section.includes("Match:"))
      .map((section) => {
        const title = section.split("\n")[0].trim();
        const matchPercentage = Number.parseInt(section.match(/Match:\s*(\d+)%/)?.[1] || "0");
        const description = section.split("\n").slice(1).join("\n").trim();
        return {
          title,
          match: matchPercentage,
          description,
        };
      });

    const parsedResult = {
      iq,
      professions,
      details,
    };

    // Store result for guest users
    if (guestId) {
      let guestIdCookie = cookieStore.get("guestId")?.value;

      if (!guestIdCookie) {
        guestIdCookie = nanoid();
        cookieStore.set("guestId", guestIdCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      await dbConnect();
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
              result: parsedResult,
            },
          },
          $setOnInsert: { guestId: guestIdCookie },
          $set: { lastActive: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
