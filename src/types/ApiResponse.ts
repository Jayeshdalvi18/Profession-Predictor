import { Message } from "@/models/User.models";

export interface ApiResponse {
    success: boolean;
    message: string;
    error?: string;
    isAcceptingMessages?: boolean;
    messages?: Message[];
}