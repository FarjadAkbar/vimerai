"use client";

import { UseFormReturn } from "react-hook-form";
import { AlertCircle, Send, Zap } from "lucide-react";
import type { GenerateVideoInput } from "@/lib/auth/schema";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "./ui/spinner";

interface GeneratorFormProps {
  form: UseFormReturn<GenerateVideoInput>;
  onSubmit: (data: GenerateVideoInput) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  mode: "preview" | "full";
  statusData?: {
    status: string;
  } | null;
  blockedReason?: {
    message: string;
    cta: { text: string; href: string };
  } | null;
  onBlockedClick?: () => void;
}

export function GeneratorForm({
  form,
  onSubmit,
  isGenerating,
  canGenerate,
  mode,
  statusData,
  blockedReason,
  onBlockedClick,
}: GeneratorFormProps) {
  const handleFormSubmit = (data: GenerateVideoInput) => {
    if (!canGenerate && blockedReason && onBlockedClick) {
      onBlockedClick();
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{form.formState.errors.root.message}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Description</FormLabel>
              <FormControl>
                {/* Glassmorphism textarea wrapper */}
                <div className="relative rounded-xl overflow-hidden border border-border/80 bg-muted/30 dark:bg-muted/20 backdrop-blur-xl shadow-lg">
                  <Textarea
                    placeholder="E.g., A professional product launch video for a new smartphone showing features like camera, battery life, and design"
                    className="min-h-40 resize-none pb-16 border-0 bg-transparent focus-visible:ring-ring/30 placeholder:text-muted-foreground/80"
                    {...field}
                    disabled={isGenerating || (mode === "full" && !canGenerate)}
                  />

                  {/* Bottom bar: Fast mode left, submit button right */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pointer-events-none">
                      <Zap className="w-4 h-4 text-foreground/70" />
                      <span className="font-medium text-foreground">Fast mode</span>
                      <span>2–5 min generation</span>
                    </div>
                    <div className="pointer-events-auto">
                      <RainbowButton
                      type="submit"
                      size="sm"
                      className={`gap-2 text-sm font-semibold h-9 rounded px-4 ${
                        !canGenerate && blockedReason
                          ? "opacity-70 cursor-pointer"
                          : ""
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isGenerating}
                      onClick={(e) => {
                        if (!canGenerate && blockedReason && onBlockedClick) {
                          e.preventDefault();
                          e.stopPropagation();
                          onBlockedClick();
                        }
                      }}
                    >
                      {isGenerating
                        ? mode === "preview"
                          ? "Generating Preview..."
                          : <Spinner className="size-6" />
                        : <Send className="size-5" />}
                    </RainbowButton>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Be as detailed as possible for best results (10-1000 characters)
              </p>
            </FormItem>
          )}
        />

        {/* mode: hidden, value is always "fast" */}
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem className="sr-only">
              <FormControl>
                <input type="hidden" {...field} value="fast" readOnly />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}