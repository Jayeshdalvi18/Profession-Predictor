import { resend } from "@/lib/resend";
import VerficationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export const sendVerificationEmail = async (email: string,username: string,otp: string): Promise<ApiResponse> => {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Verify your email",
            react: VerficationEmail({ username, otp }),
        });
        return {
            success: true,
            message: "Verification email sent successfully",
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send verification email",
            error: (error as Error).message,
        };
    }
};