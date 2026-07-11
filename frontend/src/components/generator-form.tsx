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
import type { ActiveKitResponse } from "@/lib/api/kits.api";

interface GeneratorFormProps {
  form: UseFormReturn<GenerateVideoInput>;
  onSubmit: (data: GenerateVideoInput) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  mode: "preview" | "full";
  activeKit?: ActiveKitResponse | null;
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
  activeKit,
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

        {activeKit && (
          <div
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
            style={{ backgroundColor: activeKit.colors.background }}
          >
            {activeKit.assets.find((a) => a.key === "logo")?.url && (
              <img
                src={activeKit.assets.find((a) => a.key === "logo")?.url}
                alt={activeKit.name}
                className="h-10 w-auto object-contain"
              />
            )}
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: activeKit.colors.primary }}
              >
                {activeKit.name}
              </p>
              <p
                className="text-xs"
                style={{ color: activeKit.colors.secondary }}
              >
                {activeKit.tagline}
              </p>
            </div>
          </div>
        )}

        {activeKit && activeKit.shotTemplates.length > 0 && (
          <FormField
            control={form.control}
            name="shotTemplate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shot type (optional)</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    aria-label="Shot type"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || undefined)
                    }
                    disabled={isGenerating}
                  >
                    <option value="">Custom prompt only</option>
                    {activeKit.shotTemplates.map((shot) => (
                      <option key={shot} value={shot}>
                        {shot.charAt(0).toUpperCase() + shot.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe your video</FormLabel>
              <FormControl>
              <div className="relative rounded-xl overflow-hidden border border-border/80 bg-muted/30 dark:bg-muted/20 backdrop-blur-xl shadow-lg">
                  <Textarea
                    placeholder="Product bottle on a marble table, slow camera orbit, soft studio lighting"
                    className="min-h-40 resize-none pb-16 border-0 bg-transparent focus-visible:ring-ring/30 placeholder:text-muted-foreground/80"
                    {...field}
                    disabled={isGenerating || (mode === "full" && !canGenerate)}
                  />

                  {/* Bottom bar: Fast mode left, submit button right */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground pointer-events-none">
                      <span className="font-medium text-foreground/80">Fast Mode</span>
                      <span className="text-muted-foreground/60 ml-2 text-xs hidden sm:inline">{"    "}Instant Results</span>
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