"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  type PasswordResetRequestInput,
  type PasswordResetInput,
} from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  usePasswordResetRequest,
  usePasswordReset,
} from "@/lib/hooks/use-auth"

export default function PasswordResetPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [emailSent, setEmailSent] = useState(false)

  const resetRequest = usePasswordResetRequest()
  const resetPassword = usePasswordReset()

  const requestForm = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  })

  const resetForm = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
    },
  })

  const onRequestSubmit = async (data: PasswordResetRequestInput) => {
    resetRequest.mutate(data.email, {
      onSuccess: () => {
        setEmailSent(true)
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Failed to send reset email. Please try again."
        requestForm.setError("root", { message })
      },
    })
  }

  const onResetSubmit = async (data: PasswordResetInput) => {
    resetPassword.mutate(data, {
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Failed to reset password. Please try again."
        resetForm.setError("root", { message })
      },
    })
  }

  // Show reset form if token is present
  if (token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Reset Password</h1>
            </div>
            <p className="text-muted-foreground">
              Enter your new password
            </p>
          </div>

          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(onResetSubmit)}
              className="space-y-4"
            >
              {resetForm.formState.errors.root && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{resetForm.formState.errors.root.message}</span>
                </div>
              )}

              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={resetPassword.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Show request form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Reset Password</h1>
          </div>
          <p className="text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>
                If an account with that email exists, a password reset link has
                been sent.
              </span>
            </div>
            <Link href="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <Form {...requestForm}>
            <form
              onSubmit={requestForm.handleSubmit(onRequestSubmit)}
              className="space-y-4"
            >
              {requestForm.formState.errors.root && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{requestForm.formState.errors.root.message}</span>
                </div>
              )}

              <FormField
                control={requestForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={resetRequest.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={resetRequest.isPending}
              >
                {resetRequest.isPending
                  ? "Sending..."
                  : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

