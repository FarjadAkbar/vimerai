"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useBrandKits,
  useCreateBrandKit,
  useUpdateBrandKit,
  useUploadBrandKitLogo,
} from "@/lib/hooks/use-brand-kits";
import type { BrandKit, BrandKitTone } from "@/lib/api/brand-kits.api";
import { PRODUCT_PATH } from "@/lib/product-path";

const tones: BrandKitTone[] = [
  "luxury",
  "professional",
  "playful",
  "bold",
  "friendly",
];

const brandConfirmSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  logoUrl: z.string().url("Upload a logo first"),
  primary: z.string().min(1, "Primary color is required"),
  tone: z.enum(["luxury", "professional", "playful", "bold", "friendly"]),
});

type BrandConfirmFormInput = z.infer<typeof brandConfirmSchema>;

const emptyValues: BrandConfirmFormInput = {
  name: "",
  logoUrl: "",
  primary: "#111111",
  tone: "professional",
};

function BrandConfirmFormFields({
  form,
  onLogoSelected,
  uploading,
}: {
  form: ReturnType<typeof useForm<BrandConfirmFormInput>>;
  onLogoSelected: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand name</FormLabel>
            <FormControl>
              <Input placeholder="Nitro Shine" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onLogoSelected(file);
                  }}
                />
                {field.value ? (
                  <p className="max-w-60 truncate text-xs text-muted-foreground">
                    {field.value}
                  </p>
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="primary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary color</FormLabel>
            <FormControl>
              <Input type="color" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tone</FormLabel>
            <FormControl>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...field}
              >
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function StudioBrandsPage() {
  const { data, isLoading } = useBrandKits();
  const createBrand = useCreateBrandKit();
  const updateBrand = useUpdateBrandKit();
  const uploadLogo = useUploadBrandKitLogo();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BrandKit | null>(null);

  const formCreate = useForm<BrandConfirmFormInput>({
    resolver: zodResolver(brandConfirmSchema),
    defaultValues: emptyValues,
  });
  const formEdit = useForm<BrandConfirmFormInput>({
    resolver: zodResolver(brandConfirmSchema),
    defaultValues: emptyValues,
  });

  const toPayload = (values: BrandConfirmFormInput) => ({
    name: values.name,
    logoUrl: values.logoUrl,
    colors: { primary: values.primary },
    tone: values.tone,
  });

  const handleLogo = (
    form: ReturnType<typeof useForm<BrandConfirmFormInput>>,
    file: File,
  ) => {
    uploadLogo.mutate(file, {
      onSuccess: ({ logoUrl }) => {
        form.setValue("logoUrl", logoUrl, { shouldValidate: true });
      },
    });
  };

  const brands = data?.brandKits ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Sparkles className="h-7 w-7" />
            Brands
          </h1>
          <p className="mt-2 text-[var(--studio-muted)]">
            Demoted library — primary Brand setup is Business DNA. Brands here
            still power Post Jobs and Video Jobs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black">
            <Link href={PRODUCT_PATH.businessDna}>Generate Business DNA</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              formCreate.reset(emptyValues);
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Brand Confirm
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : brands.length === 0 ? (
        <div className="rounded-3xl border border-[var(--studio-border)] bg-white p-8 text-center shadow-[0_18px_40px_rgba(30,58,95,0.08)]">
          <h2 className="text-xl font-semibold">No Brands yet</h2>
          <p className="mt-2 text-sm text-[var(--studio-muted)]">
            Paste a business URL to generate Business DNA, or use Brand Confirm
            for a quick manual Brand.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black">
              <Link href={PRODUCT_PATH.businessDna}>Generate Business DNA</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                formCreate.reset(emptyValues);
                setCreateOpen(true);
              }}
            >
              Brand Confirm
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-2xl border border-[var(--studio-border)] bg-white p-5 shadow-[0_12px_28px_rgba(30,58,95,0.06)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{brand.name}</h2>
                  <p className="capitalize text-sm text-[var(--studio-muted)]">
                    {brand.tone}
                    {brand.businessDna?.websiteUrl
                      ? ` · ${brand.businessDna.websiteUrl}`
                      : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(brand);
                    formEdit.reset({
                      name: brand.name,
                      logoUrl: brand.logoUrl,
                      primary: brand.colors.primary,
                      tone: brand.tone,
                    });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="h-12 w-12 rounded object-contain bg-[var(--studio-panel)]"
                />
                <span
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: brand.colors.primary }}
                />
                {brand.businessDna ? (
                  <Link
                    href={PRODUCT_PATH.businessDna}
                    className="ml-auto text-sm underline text-[var(--studio-muted)]"
                  >
                    Business DNA
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Brand Confirm</DialogTitle>
            <DialogDescription>
              Manual Brand fields: name, logo, primary color, and tone.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit((values) => {
                createBrand.mutate(toPayload(values), {
                  onSuccess: () => setCreateOpen(false),
                });
              })}
              className="space-y-4"
            >
              <BrandConfirmFormFields
                form={formCreate}
                uploading={uploadLogo.isPending}
                onLogoSelected={(file) => handleLogo(formCreate, file)}
              />
              <DialogFooter>
                <Button type="submit" disabled={createBrand.isPending}>
                  {createBrand.isPending ? "Saving…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update Brand Confirm fields.</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit((values) => {
                if (!editing) return;
                updateBrand.mutate(
                  { id: editing.id, data: toPayload(values) },
                  { onSuccess: () => setEditing(null) },
                );
              })}
              className="space-y-4"
            >
              <BrandConfirmFormFields
                form={formEdit}
                uploading={uploadLogo.isPending}
                onLogoSelected={(file) => handleLogo(formEdit, file)}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateBrand.isPending}>
                  {updateBrand.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
