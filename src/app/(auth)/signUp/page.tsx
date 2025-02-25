"use client";

// This is a client-side component for user registration
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Main component for user sign-up functionality
const SignUp = () => {
  // State for storing and managing the username input
  const [usernameValue, setUsernameValue] = useState("");
  // State for storing messages related to username availability
  const [usernameMessage, setUsernameMessage] = useState("");
  // State for tracking if a username check is in progress
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  // State for tracking if the form is being submitted
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSetUsername = useDebounceCallback(setUsernameValue, 300);
  const { toast } = useToast();
  const router = useRouter();

  // Initialize the form with Zod schema for validation
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  // Effect hook for checking username uniqueness
  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      if (usernameValue) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/checkUsernameUnique?username=${usernameValue}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message || "");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUniqueness();
  }, [usernameValue]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signUp", data);
      toast({ title: "Success", description: response.data.message });
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Sign Up Failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the sign-up form
  return (
    // Main container
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Card container for the form */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {/* Header section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign Up to Start your Anonymous Adventure</p>
        </div>

        {/* Sign up form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debouncedSetUsername(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && (
                    <p className="text-sm text-gray-500">
                      Checking username...
                    </p>
                  )}
                  {usernameMessage && (
                    <p
                      className={`text-sm ${usernameMessage === "Username is unique and available" ? "text-green-500" : "text-red-500"}`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>

        {/* Sign in link for existing users */}
        <div className="text-center mt-4">
          <p>
            Already have an account?{" "}
            <Link href="/signIn" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
