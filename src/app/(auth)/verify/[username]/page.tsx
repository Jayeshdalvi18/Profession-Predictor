"use client"

import { useToast } from "@/hooks/use-toast"
import { verifySchema } from "@/schemas/verifySchema"
import type { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { type AxiosError } from "axios"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

const VerifyAccount = () => {
  const router = useRouter()
  const params = useParams<{ username: string }>()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  })
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verifyCode`, {
        username: params.username,
        code: data.verifyCode,
      })
      toast({
        title: "Success",
        description: response.data.message,
      })
      router.replace("/signIn")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Verification failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      })
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Your Account</h1>
          <p className="text-muted-foreground">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verifyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>Please enter the one-time password sent to your email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default VerifyAccount

