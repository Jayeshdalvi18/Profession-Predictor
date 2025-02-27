"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import Link from "next/link"
import { useDebounceCallback } from "usehooks-ts"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/schemas/signUpSchema"
import axios, { type AxiosError } from "axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const SignUp = () => {
  const [usernameValue, setUsernameValue] = useState("")
  const [usernameMessage, setUsernameMessage] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debouncedSetUsername = useDebounceCallback(setUsernameValue, 300)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "" },
  })

  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      if (usernameValue) {
        setIsCheckingUsername(true)
        setUsernameMessage("")
        try {
          const response = await axios.get<ApiResponse>(`/api/checkUsernameUnique?username=${usernameValue}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message || "")
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUniqueness()
  }, [usernameValue])

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/signUp", data)
      toast({ title: "Success", description: response.data.message })
      router.replace(`/verify/${data.username}`)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Sign Up Failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Join Profession Predictor</h1>
          <p className="text-muted-foreground">Sign Up to Start the Amazing Journey</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        field.onChange(e)
                        debouncedSetUsername(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <p className="text-sm text-muted-foreground">Checking username...</p>}
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signIn" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp

