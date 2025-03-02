import type { NextApiRequest, NextApiResponse } from "next"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end() // Method Not Allowed
  }

  try {
    const { email, name, message } = req.body

    if (!email || !name || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { data } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "your_email@example.com",
      subject: `New message from ${name}`,
      html: `
        <h1>New message from ${name}</h1>
        <p>Email: ${email}</p>
        <p>Message: ${message}</p>
      `,
    })

    return res.status(200).json({ message: "Email sent successfully", data })
  } catch (error) {
    console.error("Error sending email:", error)
    return res.status(500).json({ error: "Failed to send email" })
  }
}

