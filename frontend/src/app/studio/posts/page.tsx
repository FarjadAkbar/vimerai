"use client";

import Link from "next/link";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useProducts } from "@/lib/hooks/use-products";

export default function StudioPostsPage() {
  const { data: brands } = useBrandKits();
  const { data: products } = useProducts();
  const brand = brands?.brandKits[0];
  const product = products?.products[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-[var(--studio-muted)]">
            Make a Post — Blitz-like phone cards, Formats, and Export. Separate
            from Videos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" disabled>
            New materials
          </Button>
          <Button className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black">
            Templates
          </Button>
          <Button variant="outline" className="rounded-full" disabled>
            Configure
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Chip
          label="Brand"
          value={brand?.name ?? "Generate Business DNA first"}
          href={brand ? undefined : "/studio/business-dna"}
        />
        <Chip
          label="Product"
          value={product?.name ?? "Add a Product"}
          href={product ? "/products" : "/products"}
        />
      </div>

      <div className="mt-10 flex min-h-[28rem] flex-col items-center justify-center">
        <div className="relative flex items-end gap-6">
          <PhoneCard
            muted
            label="Format reference"
            title="Listicle hook"
            body="Problem → proof → CTA"
          />
          <PhoneCard
            featured
            label="Post preview"
            title={
              brand
                ? `5 essentials for ${brand.name}`
                : "Your next Post image"
            }
            body={
              product
                ? `Conditioned on ${product.name}`
                : "Pick a Product, then run a Post Job"
            }
          />
          <PhoneCard
            muted
            label="Next Format"
            title="Problem-solution"
            body="Coming with Format catalog"
          />
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
            aria-label="Reject"
            disabled
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium shadow-lg"
            disabled
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
            aria-label="Accept"
            disabled
          >
            <Check className="h-6 w-6" />
          </button>
        </div>

        <p className="mt-6 max-w-md text-center text-sm text-[var(--studio-muted)]">
          Post Job generation wires in ticket 03. This surface is ready for
          Format pick → phone preview → Export.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/studio/business-dna">Business DNA</Link>
          </Button>
          <Button asChild className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black">
            <Link href="/studio/videos">Go to Videos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--studio-chip)] px-3 py-1.5">
      <span className="text-[var(--studio-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function PhoneCard({
  title,
  body,
  label,
  featured,
  muted,
}: {
  title: string;
  body: string;
  label: string;
  featured?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-black/5 bg-gradient-to-b from-[#1e3a5f] to-[#0f172a] text-white shadow-xl transition ${
        featured
          ? "h-[26rem] w-[15rem] scale-105"
          : muted
            ? "h-[22rem] w-[12rem] opacity-70"
            : "h-[24rem] w-[13rem]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
      <div className="relative flex h-full flex-col p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
          {label}
        </p>
        <div className="mt-auto space-y-2 pb-6">
          <p className="text-lg font-semibold leading-snug">{title}</p>
          <p className="text-xs text-white/75">{body}</p>
        </div>
        {featured ? (
          <div className="flex justify-center gap-1 pb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
