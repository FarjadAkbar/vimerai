"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/auth/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSignup } from "@/lib/hooks/use-auth";
import { useState } from "react";
import { storage } from "@/lib/utils/storage";
export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  // Auto save to login page
  const onSubmit = async (data: SignupInput) => {
    signup.mutate(data, {
      onSuccess: () => {
        storage.setRememberedEmail(data.email);
      },
      onError: (error: unknown) => {
        const errorResponse = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        const message =
        errorResponse?.response?.data?.message ||
        "Signup failed. Please try again.";
        
        const status = errorResponse?.response?.status;
        
        console.log('Signup error:', data);
        // Check if it's a conflict (user already exists)
        if (
          status === 409 ||
          message.toLowerCase().includes("already exists") ||
          message.toLowerCase().includes("user with this email")
        ) {
          form.setError("root", {
            message:
              "This email already exists. Please sign in or reset your password.",
            type: "conflict",
          });
        } else {
          form.setError("root", { message });
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Sign up with your email to get started</p>
        </div>

        <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 dark:ring-white/5">
          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="p-4 text-sm bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-destructive font-medium">
                      {form.formState.errors.root.message}
                    </p>
                    {form.formState.errors.root.type === "conflict" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link href="/login" className="block">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              Sign In Instead
                            </Button>
                          </Link>
                          <Link href="/password-reset" className="block">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              Forgot Password?
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                      disabled={signup.isPending}
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
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={signup.isPending}
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
                    Must be at least 8 characters with uppercase, lowercase, and
                    number
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={signup.isPending}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isConfirmPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={signup.isPending}
            >
              {signup.isPending ? "Creating account..." : "Sign up"}
              
            </Button>
          </form>
        </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
