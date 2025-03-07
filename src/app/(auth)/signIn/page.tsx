"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { signinSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"
import { Separator } from "@/components/ui/separator"

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: z.infer<typeof signinSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        toast({
          title: "Sign In Failed",
          description: result.error === "CredentialsSignin" ? "Invalid email or password." : result.error,
          variant: "destructive",
        })
      } else {
        router.push("/")
      }
    } catch (error) {
      toast({ title: "Sign In Failed", description: String(error), variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProviderSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/" })
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" className="bg-zinc-800 border-zinc-700 text-white" {...field} />
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
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-zinc-400">Password</FormLabel>
                    <Link href="/forgot-password" className="text-sm text-zinc-400 hover:text-white">
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full bg-white hover:bg-zinc-200 text-black">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            onClick={() => handleProviderSignIn("google")}
          >
            <FcGoogle className="h-5 w-5 mr-2" /> Google
          </Button>
          <Button
            variant="outline"
            className="w-full bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            onClick={() => handleProviderSignIn("github")}
          >
            <FaGithub className="h-5 w-5 mr-2" /> GitHub
          </Button>
        </div>

        <div className="text-center">
          <p className="text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/signUp" className="text-white hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn

