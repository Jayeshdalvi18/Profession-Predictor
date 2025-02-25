import { z } from 'zod';
export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/[a-zA-Z][a-zA-Z0-9-_]{3,32}/gi);

export const signupSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }).regex(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
})