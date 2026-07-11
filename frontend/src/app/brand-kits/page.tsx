"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Palette, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  useBrandKits,
  useCreateBrandKit,
  useUpdateBrandKit,
  useUploadBrandKitLogo,
} from "@/lib/hooks/use-brand-kits";
import { useUser } from "@/lib/hooks/use-user";
import type { BrandKit, BrandKitTone } from "@/lib/api/brand-kits.api";

const tones: BrandKitTone[] = [
  "luxury",
  "professional",
  "playful",
  "bold",
  "friendly",
];

const brandKitSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  logoUrl: z.string().url("Upload a logo first"),
  primary: z.string().min(1, "Primary color is required"),
  secondary: z.string().min(1, "Secondary color is required"),
  tone: z.enum(["luxury", "professional", "playful", "bold", "friendly"]),
  audience: z.string().min(1, "Audience is required").max(500),
  thingsToAvoid: z.string().min(1, "Things to avoid is required").max(1000),
  aiInstructions: z.string().max(2000).optional(),
});

type BrandKitFormInput = z.infer<typeof brandKitSchema>;

const emptyValues: BrandKitFormInput = {
  name: "",
  logoUrl: "",
  primary: "#111111",
  secondary: "#C9A227",
  tone: "professional",
  audience: "",
  thingsToAvoid: "",
  aiInstructions: "",
};

function BrandKitFormFields({
  form,
  onLogoSelected,
  uploading,
}: {
  form: ReturnType<typeof useForm<BrandKitFormInput>>;
  onLogoSelected: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                  <p className="text-xs text-muted-foreground truncate">
                    {field.value}
                  </p>
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
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
          name="secondary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
      <FormField
        control={form.control}
        name="audience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Audience</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Who is this brand for?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="thingsToAvoid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Things to avoid</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Slang, hype, discounts…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="aiInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AI instructions (optional)</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Extra voice guidance" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function BrandKitsPage() {
  const router = useRouter();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data, isLoading } = useBrandKits(isLoggedIn);
  const createBrandKit = useCreateBrandKit();
  const updateBrandKit = useUpdateBrandKit();
  const uploadLogo = useUploadBrandKitLogo();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BrandKit | null>(null);

  const formCreate = useForm<BrandKitFormInput>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: emptyValues,
  });
  const formEdit = useForm<BrandKitFormInput>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isLoggedIn && userData !== undefined) {
      router.push("/login");
    }
  }, [isLoggedIn, userData, router]);

  const toPayload = (values: BrandKitFormInput) => ({
    name: values.name,
    logoUrl: values.logoUrl,
    colors: { primary: values.primary, secondary: values.secondary },
    tone: values.tone,
    audience: values.audience,
    thingsToAvoid: values.thingsToAvoid,
    aiInstructions: values.aiInstructions || undefined,
  });

  const handleLogo = (
    form: ReturnType<typeof useForm<BrandKitFormInput>>,
    file: File,
  ) => {
    uploadLogo.mutate(file, {
      onSuccess: ({ logoUrl }) => {
        form.setValue("logoUrl", logoUrl, { shouldValidate: true });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Palette className="h-7 w-7" />
              Brand Kits
            </h1>
            <p className="text-muted-foreground mt-2">
              Set your brand voice before generating content. Required for Products
              and Generations.
            </p>
          </div>
          <Button onClick={() => {
            formCreate.reset(emptyValues);
            setCreateOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Brand Kit
          </Button>
        </div>

        {!isLoggedIn ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>
                <Link href="/login" className="underline">
                  Log in
                </Link>{" "}
                to manage Brand Kits.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (data?.brandKits.length ?? 0) === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Brand Kits yet</CardTitle>
              <CardDescription>
                Create your first Brand Kit with name, logo, colors, tone, audience,
                and things to avoid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setCreateOpen(true)}>Create Brand Kit</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.brandKits.map((kit) => (
              <Card key={kit.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>{kit.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {kit.tone} · {kit.audience}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(kit);
                      formEdit.reset({
                        name: kit.name,
                        logoUrl: kit.logoUrl,
                        primary: kit.colors.primary,
                        secondary: kit.colors.secondary,
                        tone: kit.tone,
                        audience: kit.audience,
                        thingsToAvoid: kit.thingsToAvoid,
                        aiInstructions: kit.aiInstructions ?? "",
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.logoUrl}
                    alt={`${kit.name} logo`}
                    className="h-12 w-12 rounded object-contain bg-muted"
                  />
                  <div className="flex gap-2">
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: kit.colors.primary }}
                    />
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: kit.colors.secondary }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Brand Kit</DialogTitle>
            <DialogDescription>
              Required fields for Phase 1 brand voice.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit((values) => {
                createBrandKit.mutate(toPayload(values), {
                  onSuccess: () => setCreateOpen(false),
                });
              })}
              className="space-y-4"
            >
              <BrandKitFormFields
                form={formCreate}
                uploading={uploadLogo.isPending}
                onLogoSelected={(file) => handleLogo(formCreate, file)}
              />
              <DialogFooter>
                <Button type="submit" disabled={createBrandKit.isPending}>
                  {createBrandKit.isPending ? "Saving…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand Kit</DialogTitle>
            <DialogDescription>Update brand voice and assets.</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit((values) => {
                if (!editing) return;
                updateBrandKit.mutate(
                  { id: editing.id, data: toPayload(values) },
                  { onSuccess: () => setEditing(null) },
                );
              })}
              className="space-y-4"
            >
              <BrandKitFormFields
                form={formEdit}
                uploading={uploadLogo.isPending}
                onLogoSelected={(file) => handleLogo(formEdit, file)}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateBrandKit.isPending}>
                  {updateBrandKit.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
