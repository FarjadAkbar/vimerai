"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Package, Pencil, Plus, X } from "lucide-react";
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
import { getApiErrorMessage } from "@/lib/api/errors";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import {
  useCreateProduct,
  useProducts,
  useScrapeProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "@/lib/hooks/use-products";
import { useUser } from "@/lib/hooks/use-user";
import type { Product } from "@/lib/api/products.api";
import { PRODUCT_PATH } from "@/lib/product-path";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  imageUrls: z.array(z.string().url()).min(1, "Add at least one image"),
  landingPageUrl: z
    .string()
    .optional()
    .refine(
      (value) => !value || value === "" || z.string().url().safeParse(value).success,
      "Enter a valid URL",
    ),
  price: z.string().optional(),
  brandKitIds: z.array(z.string().uuid()).optional(),
});

type ProductFormInput = z.infer<typeof productSchema>;

const emptyValues: ProductFormInput = {
  name: "",
  description: "",
  imageUrls: [],
  landingPageUrl: "",
  price: "",
  brandKitIds: [],
};

export default function ProductsPage() {
  const router = useRouter();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data: productsData, isLoading } = useProducts(isLoggedIn);
  const { data: brandKitsData } = useBrandKits(isLoggedIn);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const scrapeProduct = useScrapeProduct();
  const uploadImage = useUploadProductImage();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const brandKits = brandKitsData?.brandKits ?? [];

  const formCreate = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });
  const formEdit = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isLoggedIn && userData !== undefined) {
      router.push("/login");
    }
  }, [isLoggedIn, userData, router]);

  const toPayload = (values: ProductFormInput) => ({
    name: values.name,
    description: values.description,
    imageUrls: values.imageUrls,
    landingPageUrl: values.landingPageUrl || undefined,
    price: values.price || undefined,
    brandKitIds:
      values.brandKitIds && values.brandKitIds.length > 0
        ? values.brandKitIds
        : undefined,
  });

  const addImage = (
    form: ReturnType<typeof useForm<ProductFormInput>>,
    file: File,
  ) => {
    uploadImage.mutate(file, {
      onSuccess: ({ imageUrl }) => {
        const current = form.getValues("imageUrls") ?? [];
        form.setValue("imageUrls", [...current, imageUrl], {
          shouldValidate: true,
        });
      },
    });
  };

  const toggleKit = (
    form: ReturnType<typeof useForm<ProductFormInput>>,
    kitId: string,
  ) => {
    const current = form.getValues("brandKitIds") ?? [];
    form.setValue(
      "brandKitIds",
      current.includes(kitId)
        ? current.filter((id) => id !== kitId)
        : [...current, kitId],
      { shouldValidate: true },
    );
  };

  const KitPicker = ({
    form,
  }: {
    form: ReturnType<typeof useForm<ProductFormInput>>;
  }) => {
    if (brandKits.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Optional:{" "}
          <Link href={PRODUCT_PATH.businessDna} className="underline">
            create a Brand via Business DNA
          </Link>{" "}
          to link later for jobs.
        </p>
      );
    }
    const selected = form.watch("brandKitIds") ?? [];
    return (
      <div className="space-y-2">
        <FormLabel>Brands (optional)</FormLabel>
        {brandKits.map((kit) => (
          <label key={kit.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(kit.id)}
              onChange={() => toggleKit(form, kit.id)}
            />
            {kit.name}
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-7 w-7" />
              Products
            </h1>
            <p className="text-muted-foreground mt-2">
              Demoted library — prefer scraping or creating a Product inline on
              Make a Post / Make a Video. Records here still power jobs.
            </p>
          </div>
          <Button
            onClick={() => {
              formCreate.reset(emptyValues);
              setScrapeUrl("");
              setScrapeError(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Product
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
                to manage Products.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (productsData?.products.length ?? 0) === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Products yet</CardTitle>
              <CardDescription>
                Paste a product page URL to scrape details, or enter them
                manually. Source URL is kept when scraped.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  formCreate.reset(emptyValues);
                  setScrapeUrl("");
                  setScrapeError(null);
                  setCreateOpen(true);
                }}
              >
                Create Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {productsData?.products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(product);
                      formEdit.reset({
                        name: product.name,
                        description: product.description,
                        imageUrls: product.imageUrls,
                        landingPageUrl: product.landingPageUrl,
                        price: product.price ?? "",
                        brandKitIds: product.brandKitIds,
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="h-14 w-14 rounded object-cover bg-muted"
                  />
                  <div className="min-w-0 text-sm text-muted-foreground">
                    <div>
                      {product.price ? `$${product.price}` : "No price"}
                      {product.brandKitIds.length > 0
                        ? ` · ${product.brandKitIds.length} Brand${
                            product.brandKitIds.length === 1 ? "" : "s"
                          }`
                        : ""}
                    </div>
                    {product.landingPageUrl ? (
                      <a
                        href={product.landingPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block truncate underline-offset-2 hover:underline"
                      >
                        {product.landingPageUrl}
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setScrapeError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Paste a product page URL to scrape name, description, and images,
              then confirm. Or fill the form manually if scrape fails.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-md border p-3">
            <label className="text-sm font-medium" htmlFor="product-scrape-url">
              Product page URL
            </label>
            <div className="flex gap-2">
              <Input
                id="product-scrape-url"
                placeholder="https://shop.example.com/products/…"
                value={scrapeUrl}
                onChange={(event) => {
                  setScrapeUrl(event.target.value);
                  setScrapeError(null);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={
                  scrapeProduct.isPending || scrapeUrl.trim().length === 0
                }
                onClick={async () => {
                  setScrapeError(null);
                  try {
                    const result = await scrapeProduct.mutateAsync({
                      url: scrapeUrl.trim(),
                    });
                    formCreate.reset({
                      name: result.scrape.name,
                      description: result.scrape.description,
                      imageUrls: result.scrape.imageUrls,
                      landingPageUrl: result.scrape.sourceUrl,
                      price: result.scrape.price ?? "",
                      brandKitIds: formCreate.getValues("brandKitIds") ?? [],
                    });
                  } catch (error) {
                    setScrapeError(
                      getApiErrorMessage(
                        error,
                        "Scrape failed — enter Product details manually",
                      ),
                    );
                  }
                }}
              >
                {scrapeProduct.isPending ? (
                  "Scraping…"
                ) : (
                  <>
                    <Link2 className="mr-1.5 h-4 w-4" />
                    Scrape
                  </>
                )}
              </Button>
            </div>
            {scrapeError ? (
              <p className="text-sm text-destructive">{scrapeError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Shopify-like product pages work best. Manual entry stays
                available below.
              </p>
            )}
          </div>
          <Form {...formCreate}>
            <form
              className="space-y-4"
              onSubmit={formCreate.handleSubmit((values) => {
                createProduct.mutate(toPayload(values), {
                  onSuccess: () => setCreateOpen(false),
                });
              })}
            >
              <ProductFields
                form={formCreate}
                uploading={uploadImage.isPending}
                onImage={(file) => addImage(formCreate, file)}
                kitPicker={<KitPicker form={formCreate} />}
              />
              <DialogFooter>
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "Saving…" : "Confirm & save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              className="space-y-4"
              onSubmit={formEdit.handleSubmit((values) => {
                if (!editing) return;
                updateProduct.mutate(
                  { id: editing.id, data: toPayload(values) },
                  { onSuccess: () => setEditing(null) },
                );
              })}
            >
              <ProductFields
                form={formEdit}
                uploading={uploadImage.isPending}
                onImage={(file) => addImage(formEdit, file)}
                kitPicker={<KitPicker form={formEdit} />}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductFields({
  form,
  onImage,
  uploading,
  kitPicker,
}: {
  form: ReturnType<typeof useForm<ProductFormInput>>;
  onImage: (file: File) => void;
  uploading: boolean;
  kitPicker: ReactNode;
}) {
  const images = form.watch("imageUrls") ?? [];
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="landingPageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price (optional)</FormLabel>
            <FormControl>
              <Input placeholder="49.00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel>Images</FormLabel>
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImage(file);
          }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((url) => (
            <div key={url} className="relative h-12 w-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-12 w-12 rounded object-cover"
              />
              <button
                type="button"
                aria-label="Remove image"
                disabled={images.length <= 1}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border text-foreground shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                onClick={() => {
                  if (images.length <= 1) return;
                  form.setValue(
                    "imageUrls",
                    images.filter((imageUrl) => imageUrl !== url),
                    { shouldValidate: true, shouldDirty: true },
                  );
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <FormMessage>
          {form.formState.errors.imageUrls?.message as string | undefined}
        </FormMessage>
      </FormItem>
      {kitPicker}
      <FormMessage>
        {form.formState.errors.brandKitIds?.message as string | undefined}
      </FormMessage>
    </div>
  );
}
