"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2, Clock, AlertCircle, Zap } from "lucide-react";
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
    // Prevent form submission if blocked
    if (!canGenerate && blockedReason && onBlockedClick) {
      onBlockedClick();
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                <Textarea
                  placeholder="E.g., A professional product launch video for a new smartphone showing features like camera, battery life, and design..."
                  className="min-h-32"
                  {...field}
                  disabled={isGenerating || (mode === "full" && !canGenerate)}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Be as detailed as possible for best results (10-1000 characters)
              </p>
            </FormItem>
          )}
        />

        {/* Fast Mode Only - Hidden Cinematic/Avatar as per Phase 1 */}
        <FormField
          control={form.control}
          name="mode"
          render={() => (
            <FormItem>
              <FormLabel>Generation Mode</FormLabel>
              <FormControl>
                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fast Mode</h3>
                      <p className="text-xs text-muted-foreground">
                        Perfect for social media. 2-5 min generation.
                      </p>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <Button
          
        > */}
          <RainbowButton type="submit"
          size="lg"
          className={`w-full gap-2 ${
            !canGenerate && blockedReason
              ? "bg-primary/50 hover:bg-primary/60 cursor-pointer"
              : "bg-primary hover:bg-primary/90"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isGenerating}
          onClick={(e) => {
            // If blocked, prevent form submission and show modal
            if (!canGenerate && blockedReason && onBlockedClick) {
              e.preventDefault();
              e.stopPropagation();
              onBlockedClick();
            }
          }}>
          {isGenerating ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              {mode === "preview"
                ? statusData?.status === "processing"
                  ? "Processing Preview..."
                  : statusData?.status === "pending"
                  ? "Generating Preview..."
                  : "Generating Preview..."
                : "Generating..."}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 " /> Generate Video 
            </>
          )}
          </RainbowButton>
        {/* </Button> */}
      </form>
    </Form>
  );
}