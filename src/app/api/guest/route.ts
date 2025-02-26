import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/dbConnect"
import GuestModel from "@/models/Guest.models"

export async function POST() {
  try {
    await dbConnect()

    const guestId = nanoid()

    // Create new guest user
    await GuestModel.create({
      guestId,
      predictionsCount: 0,
    })

    // Set cookie
    ;(await
          // Set cookie
          cookies()).set("guestId", guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1, // 1 hour
    })

    return Response.json({
      success: true,
      message: "Guest login successful",
    })
  } catch (error) {
    console.error("Guest login error:", error)
    return Response.json({ error: "Failed to create guest session" }, { status: 500 })
  }
}

