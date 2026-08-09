"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Product } from "@/lib/api/products.api";
import {
  useCreateProduct,
  useScrapeProduct,
} from "@/lib/hooks/use-products";

type Props = {
  title?: string;
  body?: string;
  onCreated: (product: Product) => void;
  onCancel?: () => void;
};

export function InlineProductCreate({
  title = "Add a Product",
  body = "Paste a product page URL to scrape name, description, and images — or enter details manually.",
  onCreated,
  onCancel,
}: Props) {
  const scrapeProduct = useScrapeProduct();
  const createProduct = useCreateProduct();

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSave =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    imageUrls.length > 0 &&
    !createProduct.isPending;

  const onScrape = async () => {
    setError(null);
    try {
      const result = await scrapeProduct.mutateAsync({
        url: scrapeUrl.trim(),
      });
      setName(result.scrape.name);
      setDescription(result.scrape.description);
      setImageUrls(result.scrape.imageUrls);
      setLandingPageUrl(result.scrape.sourceUrl);
      setPrice(result.scrape.price ?? "");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Scrape failed — enter Product details manually",
        ),
      );
    }
  };

  const onSave = async () => {
    if (!canSave) return;
    setError(null);
    try {
      const result = await createProduct.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        imageUrls,
        landingPageUrl: landingPageUrl.trim() || undefined,
        price: price.trim() || undefined,
      });
      onCreated(result.product);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create Product"));
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-[var(--studio-border)] bg-white p-6 shadow-[0_18px_40px_rgba(30,58,95,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-[var(--studio-muted)]">{body}</p>

      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium" htmlFor="inline-product-url">
          Product page URL
        </label>
        <div className="flex gap-2">
          <Input
            id="inline-product-url"
            placeholder="https://shop.example.com/products/…"
            value={scrapeUrl}
            onChange={(event) => {
              setScrapeUrl(event.target.value);
              setError(null);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            disabled={
              scrapeProduct.isPending || scrapeUrl.trim().length === 0
            }
            onClick={onScrape}
          >
            {scrapeProduct.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Link2 className="mr-1.5 h-4 w-4" />
                Scrape
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--studio-muted)]">Name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Product name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--studio-muted)]">
            Description
          </span>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short product description"
            rows={4}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--studio-muted)]">
            Image URL (at least one)
          </span>
          <Input
            value={imageUrls[0] ?? ""}
            onChange={(event) => {
              const value = event.target.value.trim();
              setImageUrls(value ? [value, ...imageUrls.slice(1)] : []);
            }}
            placeholder="https://…"
          />
          {imageUrls.length > 1 ? (
            <p className="mt-1 text-xs text-[var(--studio-muted)]">
              +{imageUrls.length - 1} more from scrape
            </p>
          ) : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--studio-muted)]">
              Source URL
            </span>
            <Input
              value={landingPageUrl}
              onChange={(event) => setLandingPageUrl(event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--studio-muted)]">
              Price
            </span>
            <Input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
          disabled={!canSave}
          onClick={onSave}
        >
          {createProduct.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Product"
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
