import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { CareerDetail, FormData } from "@/types/form"

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

// Update the POST function to better handle the AI response and ensure proper JSON formatting
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
- Include an estimated IQ score between 110-140 based on the complexity of skills, education, and interests

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

    // Improved IQ extraction with fallback and range validation
    let iq = 120 // Default reasonable value if extraction fails
    const iqMatch = text.match(/IQ.*?(\d+)/i) || text.match(/estimated IQ.*?(\d+)/i) || text.match(/score of (\d+)/i)
    if (iqMatch && iqMatch[1]) {
      const extractedIQ = Number.parseInt(iqMatch[1])
      // Validate the IQ is in a reasonable range
      if (extractedIQ >= 90 && extractedIQ <= 150) {
        iq = extractedIQ
      }
    }

    // Extract professions with better error handling
    const professionsMatch =
      text.match(/CAREER RECOMMENDATIONS:([\s\S]*?)(?=DETAILED ANALYSIS|$)/i) ||
      text.match(/CAREER SUGGESTIONS:([\s\S]*?)(?=DETAILED ANALYSIS|$)/i) ||
      text.match(/RECOMMENDED CAREERS:([\s\S]*?)(?=DETAILED ANALYSIS|$)/i)

    let professions: string[] = []
    if (professionsMatch && professionsMatch[1]) {
      professions = professionsMatch[1]
        .split(/\d+\.\s+/)
        .filter((p) => p.trim())
        .map((p) => p.replace(/^\s*-\s*/, "").trim())
    }

    // Ensure we have exactly 6 professions with better fallbacks
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

    // If we couldn't extract any professions, use all generics
    if (professions.length === 0) {
      professions = genericProfessions.slice(0, 6)
    }
    // If we have some but not enough, add generics to reach 6
    else
      while (professions.length < 6) {
        const genericProfession = genericProfessions[professions.length % genericProfessions.length]
        if (!professions.includes(genericProfession)) {
          professions.push(genericProfession)
        }
      }

    // Extract detailed analysis with improved pattern matching
    let details: CareerDetail[] = []
    try {
      details = text
        .split(/\d+\.\s+Title:|Career \d+:|Profession \d+:|Career Path \d+:/i)
        .filter(
          (section) =>
            section.includes("Match:") || section.includes("match:") || section.includes("Match percentage:"),
        )
        .map((section) => {
          const titleMatch = section.match(/^([^:]+?)(?:\r?\n|:)/) || section.match(/^([^(]+?)(?:$$\d+%$$)/)
          const title = titleMatch ? titleMatch[1].trim() : "Career Option"

          const matchPercentage = Number.parseInt(
            section.match(/Match:\s*(\d+)%/i)?.[1] ||
              section.match(/match percentage:\s*(\d+)%/i)?.[1] ||
              section.match(/$$(\d+)%$$/i)?.[1] ||
              "85",
          )

          // Get everything after the match percentage and simplify formatting
          const descriptionStart =
            section.indexOf("Match:") > -1
              ? section.indexOf("Match:")
              : section.indexOf("match percentage:") > -1
                ? section.indexOf("match percentage:")
                : section.indexOf("(") > -1
                  ? section.indexOf(")") + 1
                  : 0

          let description =
            descriptionStart > -1
              ? section
                  .substring(descriptionStart)
                  .replace(/^Match:\s*\d+%/, "")
                  .replace(/^match percentage:\s*\d+%/, "")
                  .trim()
              : section.trim()

          // Simplify formatting but preserve structure
          description = description
            .replace(/[•\-*]/g, "") // Remove bullets and special characters
            .replace(/\r?\n+/g, "\n") // Normalize line breaks
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
    } catch (error) {
      console.error("Error parsing career details:", error)
      // Fallback if parsing fails
      details = []
    }

    // Ensure we have exactly 6 details with better fallbacks
    if (details.length === 0 || details.length < 6) {
      // Create fallback details for each profession
      const fallbackDetails = professions.slice(0, 6).map((profession, index) => {
        return {
          title: profession,
          match: 90 - index * 3, // Decreasing match percentages
          description: `
Skills Alignment: This career path aligns with your ${formData.skills ? formData.skills.split(",")[0] : "technical"} skills and ${formData.interests ? formData.interests.split(",")[0] : "interests"}.

Growth Potential: This field is experiencing significant growth with emerging opportunities in specialized areas.

Work-Life Balance: Typically offers a flexible schedule with options for remote work and project-based assignments.

Required Skills: Consider developing expertise in industry-specific tools and methodologies through specialized courses.

Salary Range: Entry-level positions typically start at $60,000-$75,000, with senior roles reaching $120,000-$150,000 depending on specialization and location.

Career Progression: Begin in an associate role, advance to specialist within 2-3 years, then to senior or lead positions by year 5, with management opportunities by year 7-10.`,
        }
      })

      // If we have some details, keep them and add fallbacks to reach 6
      if (details.length > 0) {
        const existingTitles = details.map((d) => d.title)
        const neededFallbacks = 6 - details.length

        for (let i = 0; i < neededFallbacks; i++) {
          const fallbackIndex = i % fallbackDetails.length
          if (!existingTitles.includes(fallbackDetails[fallbackIndex].title)) {
            details.push(fallbackDetails[fallbackIndex])
          }
        }
      } else {
        // If no details were extracted, use all fallbacks
        details = fallbackDetails
      }
    }

    // Ensure we have exactly 6 details
    details = details.slice(0, 6)

    const parsedResult = {
      iq,
      professions: professions.slice(0, 6), // Ensure exactly 6 professions
      details: details, // Ensure exactly 6 details
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("API Error:", error)
    // Return a fallback response if an error occurs
    const fallbackResponse = {
      iq: 120,
      professions: [
        "Software Developer",
        "Data Analyst",
        "Project Manager",
        "Marketing Specialist",
        "Financial Advisor",
        "Business Consultant",
      ],
      details: [
        {
          title: "Software Developer",
          match: 92,
          description:
            "Skills Alignment: Your technical skills and problem-solving abilities make you well-suited for software development.\n\nGrowth Potential: The tech industry continues to expand with numerous opportunities.\n\nWork-Life Balance: Many companies offer flexible schedules and remote work options.\n\nRequired Skills: Consider strengthening your programming skills through online courses or bootcamps.\n\nSalary Range: Entry-level positions start at $70,000-$85,000, with senior roles reaching $120,000-$160,000.\n\nCareer Progression: Start as a junior developer, advance to mid-level in 2-3 years, and senior roles by year 5.",
        },
        {
          title: "Data Analyst",
          match: 88,
          description:
            "Skills Alignment: Your analytical abilities and attention to detail align well with data analysis.\n\nGrowth Potential: Data-driven decision making is becoming essential across industries.\n\nWork-Life Balance: Generally offers regular hours with some flexibility.\n\nRequired Skills: Focus on SQL, Excel, and data visualization tools like Tableau or Power BI.\n\nSalary Range: Starting salaries range from $60,000-$75,000, increasing to $90,000-$110,000 with experience.\n\nCareer Progression: Begin as a junior analyst, move to senior analyst in 3-4 years, with potential to become a data scientist or analytics manager.",
        },
        {
          title: "Project Manager",
          match: 85,
          description:
            "Skills Alignment: Your organizational and communication skills are valuable for project management.\n\nGrowth Potential: Project managers are needed across virtually all industries.\n\nWork-Life Balance: Can be demanding during critical project phases but generally predictable.\n\nRequired Skills: Consider PMP certification and experience with project management software.\n\nSalary Range: Entry positions start at $65,000-$80,000, with experienced managers earning $100,000-$130,000.\n\nCareer Progression: Start as a project coordinator, advance to project manager in 2-3 years, with senior or program management roles by year 6-7.",
        },
        {
          title: "Marketing Specialist",
          match: 82,
          description:
            "Skills Alignment: Your creativity and communication skills are well-suited for marketing roles.\n\nGrowth Potential: Digital marketing continues to expand with new channels and technologies.\n\nWork-Life Balance: Generally offers regular hours with occasional campaigns requiring extra time.\n\nRequired Skills: Develop knowledge of digital marketing platforms, analytics, and content creation.\n\nSalary Range: Entry-level positions range from $50,000-$65,000, with senior specialists earning $80,000-$100,000.\n\nCareer Progression: Begin as a marketing assistant, move to specialist in 1-2 years, and marketing manager by year 5.",
        },
        {
          title: "Financial Advisor",
          match: 78,
          description:
            "Skills Alignment: Your analytical skills and interest in helping others align with financial advising.\n\nGrowth Potential: Financial services remain essential with growing demand for personalized advice.\n\nWork-Life Balance: Often allows for flexible scheduling once established.\n\nRequired Skills: Consider financial certifications like CFP or Series 7 license.\n\nSalary Range: Starting around $55,000-$70,000, with experienced advisors earning $100,000-$150,000+.\n\nCareer Progression: Start as a financial analyst or junior advisor, build client base over 3-5 years, and advance to senior advisor or independent practice.",
        },
        {
          title: "Business Consultant",
          match: 75,
          description:
            "Skills Alignment: Your problem-solving abilities and business knowledge are valuable for consulting.\n\nGrowth Potential: Businesses continually seek expertise to improve operations and strategy.\n\nWork-Life Balance: Can involve travel and variable hours but often with flexibility.\n\nRequired Skills: Develop industry expertise, business analysis methods, and presentation skills.\n\nSalary Range: Entry positions start at $65,000-$85,000, with experienced consultants earning $120,000-$180,000+.\n\nCareer Progression: Begin as a junior consultant, advance to consultant in 2-3 years, and senior consultant or specialized expert by year 5-7.",
        },
      ],
    }
    return NextResponse.json(fallbackResponse)
  }
}

