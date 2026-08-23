"use client";

import Link from "next/link";
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
  FormMessage,
} from "@/components/ui/form";
import { useSignup } from "@/lib/hooks/use-auth";
import { useState } from "react";
import { storage } from "@/lib/utils/storage";
import { AuthShell } from "@/components/auth/auth-shell";
import { Checkbox } from "@/components/ui/checkbox";

const inputClassName =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 focus-visible:ring-neutral-400";

export default function SignupPage() {
  const signup = useSignup();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    if (!acceptTerms) {
      form.setError("root", {
        message: "Please accept the Terms of Service and Privacy Policy.",
      });
      return;
    }

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
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="p-3 text-sm bg-red-50 border border-red-100 rounded-xl space-y-2">
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{form.formState.errors.root.message}</p>
              </div>
              {form.formState.errors.root.type === "conflict" && (
                <div className="flex flex-wrap gap-2 pl-6">
                  <Link href="/login">
                    <Button type="button" variant="outline" size="sm">
                      Sign in instead
                    </Button>
                  </Link>
                  <Link href="/password-reset">
                    <Button type="button" variant="ghost" size="sm">
                      Forgot password?
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email address"
                    className={inputClassName}
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
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Password"
                      className={`${inputClassName} pr-10`}
                      {...field}
                      disabled={signup.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      aria-label={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                    >
                      {isPasswordVisible ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder="Confirm password"
                      className={`${inputClassName} pr-10`}
                      {...field}
                      disabled={signup.isPending}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      aria-label={
                        isConfirmPasswordVisible
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(v) => setAcceptTerms(v === true)}
                disabled={signup.isPending}
                className="mt-0.5"
              />
              <span className="text-xs text-neutral-600 leading-relaxed">
                By clicking Continue, you agree to our Terms of Service and
                Privacy Policy.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={marketingEmails}
                onCheckedChange={(v) => setMarketingEmails(v === true)}
                disabled={signup.isPending}
                className="mt-0.5"
              />
              <span className="text-xs text-neutral-600 leading-relaxed">
                Keep me updated with tips and messages by email.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
            disabled={signup.isPending}
          >
            {signup.isPending ? "Creating account…" : "Continue"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-neutral-900 font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
