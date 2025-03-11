import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { FormData } from "@/types/form"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Maximum number of predictions allowed for guest users
const MAX_GUEST_PREDICTIONS = 3

function constructUserBio(formData: FormData): string {
  let bio = `Age Group: ${formData.ageGroup || "Not specified"}\n`
  bio += `Education: ${formData.education || "Not specified"}\n`
  bio += `Work Style Preference: ${formData.workStyle || "Not specified"}\n\n`

  // Add project URL if provided
  if (formData.projectUrl) {
    bio += `Portfolio/Project URL: ${formData.projectUrl}\n\n`
  }

  bio += "Skills:\n"
  bio += formData.skills ? formData.skills + "\n\n" : "Not specified\n\n"

  bio += "Hobbies:\n"
  bio += formData.hobbies ? formData.hobbies + "\n\n" : "Not specified\n\n"

  bio += "Interests:\n"
  bio += formData.interests ? formData.interests + "\n\n" : "Not specified\n\n"

  bio += "Languages Known:\n"
  bio += formData.languages ? formData.languages + "\n\n" : "Not specified\n\n"

  // Add age-group specific information
  if (formData.ageGroup === "student") {
    bio += "Favorite Subjects:\n"
    bio += formData.favoriteSubjects ? formData.favoriteSubjects + "\n\n" : "Not specified\n\n"

    bio += "Extracurricular Activities:\n"
    bio += formData.extracurriculars ? formData.extracurriculars + "\n\n" : "Not specified\n\n"

    // Add new field
    if (formData.careerGoals) {
      bio += "Early Career Goals:\n"
      bio += formData.careerGoals + "\n\n"
    }

    // Add mentorship interest if available
    if (formData.mentorshipInterest) {
      bio += "Mentorship Interest:\n"
      bio += formData.mentorshipInterest + "\n\n"
    }
  }

  if (formData.ageGroup === "college") {
    bio += "Major:\n"
    bio += formData.major ? formData.major + "\n\n" : "Not specified\n\n"

    bio += "Minors/Secondary Fields:\n"
    bio += formData.minors ? formData.minors + "\n\n" : "Not specified\n\n"

    bio += "Internships/Work Experience:\n"
    bio += formData.internships ? formData.internships + "\n\n" : "Not specified\n\n"

    // Add new field
    if (formData.academicInterests) {
      bio += "Specific Academic Interests:\n"
      bio += formData.academicInterests + "\n\n"
    }

    // Add mentorship interest if available
    if (formData.mentorshipInterest) {
      bio += "Mentorship Interest:\n"
      bio += formData.mentorshipInterest + "\n\n"
    }
  }

  if (["earlyCareer", "midCareer", "lateCareer"].includes(formData.ageGroup)) {
    bio += "Work Experience:\n"
    bio += formData.workExperience ? formData.workExperience + "\n\n" : "Not specified\n\n"

    bio += "Professional Achievements:\n"
    bio += formData.achievements ? formData.achievements + "\n\n" : "Not specified\n\n"

    bio += "Certifications/Specialized Training:\n"
    bio += formData.certifications ? formData.certifications + "\n\n" : "Not specified\n\n"

    // Add career-specific fields
    if (formData.ageGroup === "earlyCareer" && formData.careerAspirations) {
      bio += "Career Aspirations (5-year):\n"
      bio += formData.careerAspirations + "\n\n"
    }

    if (formData.ageGroup === "midCareer" && formData.careerChallenges) {
      bio += "Current Career Challenges:\n"
      bio += formData.careerChallenges + "\n\n"
    }

    if (formData.ageGroup === "lateCareer") {
      if (formData.futureGoals) {
        bio += "Future Career Goals:\n"
        bio += formData.futureGoals + "\n\n"
      }

      if (formData.legacyInterests) {
        bio += "Legacy Interests:\n"
        bio += formData.legacyInterests + "\n\n"
      }
    }

    // Add work-life balance preference if available
    if (formData.workLifeBalance) {
      bio += "Work-Life Balance Importance:\n"
      bio += formData.workLifeBalance + "\n\n"
    }
  }

  if (formData.ageGroup === "careerChange") {
    bio += "Reason for Career Change:\n"
    bio += formData.reasonForChange ? formData.reasonForChange + "\n\n" : "Not specified\n\n"

    bio += "Transferable Skills:\n"
    bio += formData.transferableSkills ? formData.transferableSkills + "\n\n" : "Not specified\n\n"

    bio += "Desired Work Environment:\n"
    bio += formData.desiredWorkEnvironment ? formData.desiredWorkEnvironment + "\n\n" : "Not specified\n\n"

    // Add new fields
    if (formData.newFieldInterests) {
      bio += "New Fields of Interest:\n"
      bio += formData.newFieldInterests + "\n\n"
    }

    if (formData.retrainingWillingness) {
      bio += "Willingness to Retrain:\n"
      bio += formData.retrainingWillingness + "\n\n"
    }
  }

  return bio
}

export async function POST(req: Request) {
  try {
    const formData = (await req.json()) as FormData

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
- Suggest EXACTLY 6 unique and distinct career paths that match the profile
- Each career must be specific (not general categories)
- Each career must have a unique match percentage between 70-98%
- Provide highly detailed and personalized explanations for each career
- For each career, provide unique and specific next steps tailored to that profession
- If a project/portfolio URL is provided, analyze it for additional insights
- Consider the person's age group and life stage
- Provide practical, actionable next steps that are specific to each career path

For each career suggestion, include:
1. Title and match percentage
2. Skills Alignment: Current relevant skills and how they specifically apply to this career (be detailed)
3. Growth Potential: Industry outlook, emerging opportunities, and future trends in this specific field
4. Work-Life Balance: Detailed description of typical schedule, environment, and lifestyle considerations
5. Required Skills: Comprehensive list of skills to develop with specific recommendations for courses, certifications, or experiences
6. Salary Range: Expected compensation with progression details at different career stages
7. Career Progression: Detailed 5-10 year path with specific role transitions and milestones

Personal Profile:
${userBio}

Format the response as clear text without special characters or markdown formatting.
Make each career description unique, detailed, and actionable with specific next steps.`

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

    // Ensure we have exactly 6 professions
    if (professions.length < 6) {
      const genericProfessions = [
        "Software Developer",
        "Data Analyst",
        "Project Manager",
        "Marketing Specialist",
        "Financial Advisor",
        "Business Consultant",
        "UX Designer",
        "Product Manager",
        "Digital Content Creator",
        "Cybersecurity Specialist",
      ]

      while (professions.length < 6) {
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

        // Simplify formatting but preserve structure
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

    // Ensure we have exactly 6 details
    if (details.length < 6) {
      for (let i = details.length; i < 6; i++) {
        if (professions[i]) {
          details.push({
            title: professions[i],
            match: 70 + i * 5,
            description: `
Skills Alignment: This career path aligns with your ${formData.skills ? formData.skills.split(",")[0] : "technical"} skills and ${formData.interests ? formData.interests.split(",")[0] : "interests"}.

Growth Potential: This field is experiencing significant growth with emerging opportunities in specialized areas.

Work-Life Balance: Typically offers a flexible schedule with options for remote work and project-based assignments.

Required Skills: Consider developing expertise in industry-specific tools and methodologies through specialized courses.

Salary Range: Entry-level positions typically start at $60,000-$75,000, with senior roles reaching $120,000-$150,000 depending on specialization and location.

Career Progression: Begin in an associate role, advance to specialist within 2-3 years, then to senior or lead positions by year 5, with management opportunities by year 7-10.`,
          })
        }
      }
    }

    const parsedResult = {
      iq,
      professions: professions.slice(0, 6), // Ensure exactly 6 professions
      details: details.slice(0, 6), // Ensure exactly 6 details
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

