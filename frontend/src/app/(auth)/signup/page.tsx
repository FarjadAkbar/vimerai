"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
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
const REMEMBERED_EMAIL_KEY = "rememberedEmail";
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
        localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
      },
      onError: (error: unknown) => {
        const errorResponse = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        const message =
          errorResponse?.response?.data?.message ||
          "Signup failed. Please try again.";
        const status = errorResponse?.response?.status;

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">VimeraAI</h1>
          </div>
          <p className="text-muted-foreground">Create your account</p>
        </div>

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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {isPasswordVisible ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {isConfirmPasswordVisible ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={signup.isPending}
            >
              {signup.isPending ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
