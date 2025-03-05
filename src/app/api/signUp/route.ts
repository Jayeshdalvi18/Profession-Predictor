// Import necessary modules and models
import { dbConnect, dbDisconnect } from "@/lib/dbConnect"
import UserModel from "@/models/User.models"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/utils/sendVerificationEmail"

// Define the POST request handler for user registration
export async function POST(request: Request) {
  // Establish a connection to the database
  await dbConnect()

  try {
    // Extract user registration data (username, email, password) from the request body
    const { username, email, password } = await request.json()

    // Check if a verified user with the same username already exists in the database
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username: username,
      isVerified: true,
    })

    // If a verified user with the same username exists, return an error response
    if (existingUserVerifiedByUsername) {
      return Response.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    // Generate a 6-digit verification code for email verification
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Check if a user with the same email already exists in the database
    const existingUserByEmail = await UserModel.findOne({
      email: email,
    })

    if (existingUserByEmail) {
      // If the existing user is already verified, return an error response
      if (existingUserByEmail.isVerified) {
        return Response.json({ success: false, message: "Email already exists" }, { status: 400 })
      } else {
        // If the existing user is not verified, update their information
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserByEmail.username = username
        existingUserByEmail.password = hashedPassword
        existingUserByEmail.verifyCode = verifyCode
        // Set the verification code expiration to 1 hour from now
        existingUserByEmail.verifyCodeExpires = new Date(Date.now() + 3600000)
        await existingUserByEmail.save()

        // Send a new verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if (!emailResponse.success) {
          return Response.json({ success: false, message: emailResponse.message }, { status: 500 })
        }
      }
    } else {
      // If no existing user is found, create a new user
      const hashedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpires: expiryDate,
        isVerified: false,
      })

      // Save the new user to the database
      await newUser.save()

      // Send a verification email to the user
      const emailResponse = await sendVerificationEmail(email, username, verifyCode)
      // If the email fails to send, return an error response
      if (!emailResponse.success) {
        console.error("Failed to send verification email:", emailResponse.error)
        // Still create the user but inform about email issues
        return Response.json(
          {
            success: true,
            message:
              "User registered successfully, but there was an issue sending the verification email. Please contact support.",
            emailError: emailResponse.error,
          },
          { status: 201 },
        )
      }
    }

    // If everything is successful, return a success response
    return Response.json(
      { success: true, message: "User registered successfully, please verify your email" },
      { status: 201 },
    )
  } catch (error) {
    // If any error occurs during the process, log it and return an error response
    console.error("Error registering user", error)
    return Response.json({ success: false, message: "Error registering user" }, { status: 500 })
  } finally {
    // Always disconnect from the database
    await dbDisconnect()
  }
}

