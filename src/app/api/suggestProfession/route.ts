import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  const { hobbies, skills, education, workStyle, interests } = await req.json()

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

  // Parse the response
  const content = response.choices[0].message.content
  const iqMatch = content?.match(/IQ.*?(\d+)/)
  const professionsMatch = content?.match(/Professions?:([\s\S]*?)(?=\n\n|$)/)

  // Extract detailed analysis
  const details = content?.split("\n\n")
    .filter((section) => section.includes("Match:"))
    .map((section) => {
      const title = section.split("\n")[0]
      const matchPercentage = Number.parseInt(section.match(/Match:\s*(\d+)%/)?.[1] || "0")
      const description = section.split("\n").slice(1).join("\n")
      return {
        title,
        match: matchPercentage,
        description,
      }
    })

  const iq = iqMatch ? Number.parseInt(iqMatch[1]) : 100
  const professions = professionsMatch
    ? professionsMatch[1]
        .split("\n")
        .filter((p) => p.trim())
        .map((p) => p.replace(/^\d+\.\s*/, "").trim())
    : []

  return Response.json({
    iq,
    professions,
    details,
  })
}

