"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/auth/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useLogin } from "@/lib/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { storage } from "@/lib/utils/storage";
import { AuthShell } from "@/components/auth/auth-shell";

const inputClassName =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 focus-visible:ring-neutral-400";

export default function LoginPage() {
  const login = useLogin();
  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  useEffect(() => {
    const rememberedEmail = storage.getRememberedEmail();
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("rememberMe", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: LoginInput) => {
    if (data.rememberMe) {
      storage.setRememberedEmail(data.email);
    } else {
      storage.clearRememberedEmail();
    }

    login.mutate(data, {
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Login failed. Please try again.";
        form.setError("root", { message });
      },
    });
  };

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{form.formState.errors.root.message}</span>
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
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isVisible ? "text" : "password"}
                      placeholder="Password"
                      className={`${inputClassName} pr-10`}
                      {...field}
                      disabled={login.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      aria-label={isVisible ? "Hide password" : "Show password"}
                    >
                      {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-4 pt-1">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={login.isPending}
                    />
                  </FormControl>
                  <label className="text-sm text-neutral-600 cursor-pointer">
                    Remember me
                  </label>
                </FormItem>
              )}
            />
            <Link
              href="/password-reset"
              className="text-sm text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium mt-2"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Continue"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-neutral-900 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
