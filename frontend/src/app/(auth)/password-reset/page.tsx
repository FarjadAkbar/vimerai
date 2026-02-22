"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react"
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

function PasswordResetContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [emailSent, setEmailSent] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

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
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Enter your new password below</p>
          </div>

          <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 dark:ring-white/5">
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
                        <div className="relative">
                          <Input
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={resetPassword.isPending}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                          >
                            {isPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
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
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Enter your email to receive a reset link</p>
        </div>

        {emailSent ? (
          <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 dark:ring-white/5 space-y-4">
            <div className="flex items-center gap-2 p-4 text-sm text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                If an account with that email exists, a password reset link has been sent.
              </span>
            </div>
            <Link href="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 dark:ring-white/5">
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
                  {resetRequest.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-muted-foreground">Reset Password</h1>
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      }
    >
      <PasswordResetContent />
    </Suspense>
  )
}