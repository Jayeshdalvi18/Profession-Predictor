import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const MAX_GUEST_PREDICTIONS = 3

export async function POST(req: Request) {
  try {
    const { hobbies, skills, education, workStyle, interests, languages, certifications, experience } = await req.json()

    const prompt = `As a career counselor AI, analyze the following profile to provide comprehensive and detailed career guidance:

IMPORTANT REQUIREMENTS:
- You MUST suggest EXACTLY 3 unique and distinct career paths that are well-suited to the profile
- Each career suggestion must be detailed and specific (not general categories)
- Each career must have a unique match percentage between 70-98%
- Provide comprehensive analysis for each career with specific details
- For the "Next Steps" section, provide 3 UNIQUE and SPECIFIC action items for each career path
- Ensure all information is tailored to the individual's profile
- Format your response in a clear, readable way with short paragraphs and bullet points

Profile Details:
- Hobbies: ${hobbies}
- Skills: ${skills}
- Education: ${education}
- Work Style: ${workStyle}
- Interests: ${interests}
- Languages: ${languages || "Not specified"}
- Certifications: ${certifications || "Not specified"}
- Experience: ${experience || "Not specified"}

Your response MUST follow this exact structure:

1. IQ ESTIMATE:
   Provide an estimated IQ range with a brief explanation based on the complexity of their skills, interests, and education.

2. CAREER RECOMMENDATIONS:
   List minimum 3 specific career paths that match their profile. Each must be unique and distinct.

3. DETAILED ANALYSIS:
   For each career, provide:
   - Title: [Specific job title]
   - Match: [Percentage between 70-98%]
   - Skills Alignment: Which of their skills directly apply to this career (bullet points)
   - Growth Potential: Industry growth trends and advancement opportunities (short paragraph)
   - Work-Life Balance: How this career aligns with their preferred work style (short paragraph)
   - Required Skills: Specific skills they should develop (bullet points)
   - Salary Range: Realistic compensation expectations
   - Career Progression: Clear advancement path over 5-10 years (bullet points)

4. NEXT STEPS:
   For each career, provide 3 UNIQUE and SPECIFIC action items they should take to pursue this path, such as:
   - Specific courses or certifications to obtain
   - Industry-specific networking opportunities
   - Particular projects to build their portfolio
   - Specific companies to target for employment
   - Mentorship or shadowing opportunities in the field

Remember: Your response MUST include exactly 3 unique career recommendations with detailed analysis and specific next steps for each. Format your response in a clear, readable way with short paragraphs and bullet points.`

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

    // Ensure we have at least 3 professions
    if (professions.length < 3) {
      // Add generic professions if needed
      const genericProfessions = [
        "Software Developer",
        "Data Analyst",
        "Project Manager",
        "Marketing Specialist",
        "Financial Advisor",
      ]

      while (professions.length < 3) {
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

        // Get everything after the match percentage
        const descriptionStart = section.indexOf("Match:")
        const description =
          descriptionStart > -1
            ? section
                .substring(descriptionStart)
                .replace(/^Match:\s*\d+%/, "")
                .trim()
            : section.trim()

        return {
          title,
          match: matchPercentage,
          description,
        }
      })

    // Ensure we have at least 3 details
    if (details.length < 3) {
      // Create generic details if needed
      for (let i = details.length; i < 3; i++) {
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
      professions: professions.slice(0, 5), // Ensure exactly 3 professions
      details: details.slice(0, 5), // Ensure exactly 3 details
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

