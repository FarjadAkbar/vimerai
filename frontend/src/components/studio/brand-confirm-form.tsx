"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { BrandKit, BrandKitTone } from "@/lib/api/brand-kits.api";
import {
  useCreateBrandKit,
  useUploadBrandKitLogo,
} from "@/lib/hooks/use-brand-kits";

const TONES: BrandKitTone[] = [
  "luxury",
  "professional",
  "playful",
  "bold",
  "friendly",
];

type Props = {
  onCreated: (brand: BrandKit) => void;
  onCancel?: () => void;
};

export function BrandConfirmForm({ onCreated, onCancel }: Props) {
  const createBrand = useCreateBrandKit();
  const uploadLogo = useUploadBrandKitLogo();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primary, setPrimary] = useState("#111111");
  const [tone, setTone] = useState<BrandKitTone>("professional");
  const [error, setError] = useState<string | null>(null);

  const canSave =
    name.trim().length > 0 &&
    logoUrl.length > 0 &&
    !createBrand.isPending &&
    !uploadLogo.isPending;

  const onLogoSelected = (file: File) => {
    setError(null);
    uploadLogo.mutate(file, {
      onSuccess: ({ logoUrl: uploaded }) => setLogoUrl(uploaded),
      onError: (err) =>
        setError(getApiErrorMessage(err, "Could not upload logo")),
    });
  };

  const onSave = async () => {
    if (!canSave) return;
    setError(null);
    try {
      const result = await createBrand.mutateAsync({
        name: name.trim(),
        logoUrl,
        colors: { primary },
        tone,
      });
      onCreated(result.brandKit);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save Brand"));
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-panel)] p-5">
      <h3 className="text-sm font-semibold tracking-tight">Brand Confirm</h3>
      <p className="mt-1 text-xs text-[var(--studio-muted)]">
        Manual fallback: name, logo, primary color, and tone.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--studio-muted)]">
            Brand name
          </span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nitro Shine"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--studio-muted)]">Logo</span>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploadLogo.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onLogoSelected(file);
            }}
          />
          {logoUrl ? (
            <p className="mt-1 truncate text-xs text-[var(--studio-muted)]">
              {logoUrl}
            </p>
          ) : null}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--studio-muted)]">
              Primary color
            </span>
            <Input
              type="color"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--studio-muted)]">Tone</span>
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value as BrandKitTone)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {TONES.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
          disabled={!canSave}
          onClick={onSave}
        >
          {createBrand.isPending || uploadLogo.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Brand"
          )}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
