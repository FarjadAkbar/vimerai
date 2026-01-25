"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, AlertCircle, Lock, Eye, EyeOff} from "lucide-react"
import { loginSchema, type LoginInput } from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { useLogin } from "@/lib/hooks/use-auth"
import { Checkbox } from "@/components/ui/checkbox"
import { storage } from "@/lib/utils/storage"

export default function LoginPage() {
  const login = useLogin()
  const [isVisible, setIsVisible] = useState(false)
  
  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = storage.getRememberedEmail()
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail)
      form.setValue("rememberMe", true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  })
  const togglePassword = () => setIsVisible(!isVisible)

  const onSubmit = async (data: LoginInput) => {
    // Store email if rememberMe is checked
    if (data.rememberMe) {
      storage.setRememberedEmail(data.email)
    } else {
      // Clear remembered email if rememberMe is unchecked
      storage.clearRememberedEmail()
    }
    
    login.mutate(data, {
      onError: (error: unknown) => {
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed. Please try again."
        form.setError("root", { message })
      },
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Link href='/'>
      {/* <ArrowLeftIcon />  */}
        </Link>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">VimeraAI</h1>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Invalid credentials. Retry with corrected input.</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={login.isPending}
                    />
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
        <div className="relative">
          <Input
            type={isVisible ? "text" : "password"}
            placeholder="••••••••"
            {...field}
            disabled={login.isPending}
            className="pr-10"   // right side space for button
          />

          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
          >
            {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      </FormControl>

      <FormMessage />
    </FormItem>
  )}
/>

            <div className="flex items-center justify-between gap-4">
              {/* Remember Me Checkbox */}
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        disabled={login.isPending}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Link
                href="/password-reset"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
