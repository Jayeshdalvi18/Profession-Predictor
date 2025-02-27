import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { dbConnect, dbDisconnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.models";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            // Authorize function to validate user credentials
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    // Find user by email or username
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.email }
                        ]
                    })
                    if (!user) throw new Error("User not found");
                    if (!user.isVerified) throw new Error("User not verified");

                    // Compare provided password with stored hashed password
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) { throw new Error("Password incorrect"); }
                    else {
                        return user
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    throw new Error(error);
                } finally {
                    // Always disconnect from the database
                    await dbDisconnect();
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    // Custom sign-in page
    pages: {
        signIn: "/signIn"
    },
    // Use JWT for session handling
    session: {
        strategy: "jwt"
    },
    // Secret for JWT encryption
    secret: process.env.SECRET,
    callbacks: {
        // Callback to customize session object
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.username = token.username
            }
            return session
        },
        // Callback to customize JWT token
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.username = user.username
            }
            return token
        },
        async signIn({ account, profile }) {
            if (account?.provider === "google" || account?.provider === "github") {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({ email: profile?.email })
                    if (!user) {
                        // Create a new user if they don't exist
                        await UserModel.create({
                            email: profile?.email,
                            username: profile?.name?.replace(/\s+/g, "").toLowerCase(),
                            isVerified: true, // Automatically verify users from OAuth providers
                            // You might want to generate a random password here
                        })
                    }
                    return true
                } catch (error) {
                    console.error("Error during OAuth sign in:", error)
                    return false
                } finally {
                    await dbDisconnect()
                }
            }
            return true
        },
    }
}

