"use client";

// This is a client-side component for user sign-in
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import { Loader2 } from 'lucide-react';
import { signinSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

// Main component for user sign-in functionality
const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Initialize the form with Zod schema for validation
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof signinSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if(result?.error) {
        if(result.error === "CredentialsSignin") {
          toast({
            title: "Invalid Credentials",
            description: "The email or password you entered is incorrect. Please try again.",
            variant: "destructive"
          })
        }else {
          toast({
            title: "Sign In Failed",
            description: result.error,
            variant: "destructive"
          })
        }
      }
      if(result?.url) {
        router.replace("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the sign-in form
  return (
    // Main container
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Card container for the form */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {/* Header section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Profession Predictor
          </h1>
          <p className="mb-4">Sign In to Start the Amazing Journey</p>
        </div>

        {/* Sign in form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Email/Username field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email / Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email or username"
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
                      placeholder="Enter your password"
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Sign up link for new users */}
        <div className="text-center mt-4">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signUp" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

