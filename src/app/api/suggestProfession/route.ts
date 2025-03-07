import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Maximum number of predictions allowed for guest users
const MAX_GUEST_PREDICTIONS = 3

export async function POST(req: Request) {
  try {
    const formData = await req.json()

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

      // Increment prediction count for guest users
      if (guest) {
        guest.predictionsCount += 1
        guest.lastActive = new Date()
        await guest.save()
      } else {
        // Create new guest record if it doesn't exist
        await GuestModel.create({
          guestId,
          predictionsCount: 1,
          createdAt: new Date(),
          lastActive: new Date(),
        })
      }
    }

    // Convert form data to a structured biography for AI analysis
    const userBio = constructUserBio(formData)

    const prompt = `As a career counselor AI, analyze the following personal profile to provide comprehensive and detailed career guidance:

IMPORTANT REQUIREMENTS:
- You MUST suggest EXACTLY 5 unique and distinct career paths that are well-suited to the profile
- Each career suggestion must be detailed and specific (not general categories)
- Each career must have a unique match percentage between 70-98%
- Provide simple, clear analysis for each career without using special characters or formatting
- For the Next Steps section, provide 3 clear action items for each career path
- Ensure all information is tailored to the individual's profile
- Use simple language and clear sentences
- Base your analysis on real-world career paths and requirements
- Consider the person's age group and life stage in your recommendations

Personal Profile:
${userBio}

Your response MUST follow this exact structure:

1. IQ ESTIMATE:
   Provide an estimated IQ range (a specific number between 100-140) with a brief explanation.

2. CAREER RECOMMENDATIONS:
   List exactly 5 specific career paths that match their profile.

3. DETAILED ANALYSIS:
   For each career, provide:
   Title: [Specific job title]
   Match: [Percentage between 70-98%]
   Skills Alignment: List their relevant skills for this career
   Growth Potential: Simple description of industry trends and opportunities
   Work-Life Balance: How this career fits their preferred work style
   Required Skills: List of skills they need to develop
   Salary Range: Expected compensation range
   Career Progression: Clear 5-10 year career path

4. NEXT STEPS:
   For each career, list 3 clear action items they should take, such as:
   - Specific courses or certifications
   - Networking opportunities
   - Portfolio projects
   - Target companies
   - Mentorship opportunities

Remember: Keep the language simple and clear. Avoid special characters or complex formatting.`

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error("Failed to get response from AI")
    }

    // Extract IQ estimate
    const iqMatch = text.match(/IQ.*?(\d+)/)
    const iq = iqMatch ? Number.parseInt(iqMatch[1]) : 100

    // Extract professions
    const professionsMatch = text.match(/CAREER RECOMMENDATIONS:([\s\S]*?)(?=DETAILED ANALYSIS|$)/i)
    const professions = professionsMatch
      ? professionsMatch[1]
          .split(/\d+\.\s+/)
          .filter((p) => p.trim())
          .map((p) => p.replace(/^\s*-\s*/, "").trim())
      : []

    // Ensure we have exactly 5 professions
    if (professions.length < 5) {
      const genericProfessions = [
        "Software Developer",
        "Data Analyst",
        "Project Manager",
        "Marketing Specialist",
        "Financial Advisor",
        "Business Consultant",
        "UX Designer",
      ]

      while (professions.length < 5) {
        const genericProfession = genericProfessions[professions.length % genericProfessions.length]
        if (!professions.includes(genericProfession)) {
          professions.push(genericProfession)
        }
      }
    }

    // Extract detailed analysis
    const details = text
      .split(/\d+\.\s+Title:|Career \d+:|Profession \d+:/i)
      .filter((section) => section.includes("Match:"))
      .map((section) => {
        const titleMatch = section.match(/^([^:]+?)(?:\n|:)/)
        const title = titleMatch ? titleMatch[1].trim() : "Career Option"

        const matchPercentage = Number.parseInt(section.match(/Match:\s*(\d+)%/i)?.[1] || "85")

        // Get everything after the match percentage and simplify formatting
        const descriptionStart = section.indexOf("Match:")
        let description =
          descriptionStart > -1
            ? section
                .substring(descriptionStart)
                .replace(/^Match:\s*\d+%/, "")
                .trim()
            : section.trim()

        // Simplify formatting
        description = description
          .replace(/[•\-*]/g, "") // Remove bullets and special characters
          .replace(/\n+/g, "\n") // Normalize line breaks
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n")

        return {
          title,
          match: matchPercentage,
          description,
        }
      })

    // Ensure we have exactly 5 details
    if (details.length < 5) {
      for (let i = details.length; i < 5; i++) {
        if (professions[i]) {
          details.push({
            title: professions[i],
            match: 70 + i * 5,
            description: `This career path aligns with your skills and interests. It offers good growth potential and work-life balance. Consider developing additional skills in this area to enhance your career prospects.`,
          })
        }
      }
    }

    const parsedResult = {
      iq,
      professions: professions.slice(0, 5), // Ensure exactly 5 professions
      details: details.slice(0, 5), // Ensure exactly 5 details
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Helper function to construct a structured biography from form data
interface FormData {
  ageGroup?: string;
  education?: string;
  workStyle?: string;
  skills?: string;
  hobbies?: string;
  interests?: string;
  languages?: string;
  favoriteSubjects?: string;
  extracurriculars?: string;
  major?: string;
  minors?: string;
  internships?: string;
  workExperience?: string;
  achievements?: string;
  certifications?: string;
  reasonForChange?: string;
  transferableSkills?: string;
  desiredWorkEnvironment?: string;
}

function constructUserBio(formData: FormData): string {
  let bio = `Age Group: ${formData.ageGroup || "Not specified"}\n`
  bio += `Education: ${formData.education || "Not specified"}\n`
  bio += `Work Style Preference: ${formData.workStyle || "Not specified"}\n\n`

  bio += "Skills:\n"
  bio += formData.skills ? formData.skills + "\n\n" : "Not specified\n\n"

  bio += "Hobbies:\n"
  bio += formData.hobbies ? formData.hobbies + "\n\n" : "Not specified\n\n"

  bio += "Interests:\n"
  bio += formData.interests ? formData.interests + "\n\n" : "Not specified\n\n"

  bio += "Languages:\n"
  bio += formData.languages ? formData.languages + "\n\n" : "Not specified\n\n"

  bio += "Favorite Subjects:\n"
  bio += formData.favoriteSubjects ? formData.favoriteSubjects + "\n\n" : "Not specified\n\n"

  bio += "Extracurricular Activities:\n"
  bio += formData.extracurriculars ? formData.extracurriculars + "\n\n" : "Not specified\n\n"

  bio += "Major:\n"
  bio += formData.major ? formData.major + "\n\n" : "Not specified\n\n"

  bio += "Minors:\n"
  bio += formData.minors ? formData.minors + "\n\n" : "Not specified\n\n"

  bio += "Internships:\n"
  bio += formData.internships ? formData.internships + "\n\n" : "Not specified\n\n"

  if (["earlyCareer", "midCareer", "lateCareer"].includes(formData.ageGroup || "")) {
    bio += "Work Experience:\n"
    bio += formData.workExperience ? formData.workExperience + "\n\n" : "Not specified\n\n"

    bio += "Professional Achievements:\n"
    bio += formData.achievements ? formData.achievements + "\n\n" : "Not specified\n\n"

    bio += "Certifications/Specialized Training:\n"
    bio += formData.certifications ? formData.certifications + "\n\n" : "Not specified\n\n"
  }

  if (formData.ageGroup === "careerChange") {
    bio += "Reason for Career Change:\n"
    bio += formData.reasonForChange ? formData.reasonForChange + "\n\n" : "Not specified\n\n"

    bio += "Transferable Skills:\n"
    bio += formData.transferableSkills ? formData.transferableSkills + "\n\n" : "Not specified\n\n"

    bio += "Desired Work Environment:\n"
    bio += formData.desiredWorkEnvironment ? formData.desiredWorkEnvironment + "\n\n" : "Not specified\n\n"
  }

  return bio
}

