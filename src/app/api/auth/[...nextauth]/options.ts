import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
                            { email: credentials.email },
                            { username: credentials.email }
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
        })
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
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
        // Callback to customize JWT token
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        }
    }
}

