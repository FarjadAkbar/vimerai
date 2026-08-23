"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/use-user";
import { PRODUCT_PATH } from "@/lib/product-path";
import {
  ACCOUNT_BULLETS,
  AGENT_CARDS,
  COMPARISON_ROWS,
  CONTROL_FEATURES,
  FAQ_ITEMS,
  STEPS,
  TESTIMONIALS,
} from "@/components/marketing/landing-data";
import { cn } from "@/lib/utils";

function MarketingCta({
  className,
  label = "Start Free Trial",
}: {
  className?: string;
  label?: string;
}) {
  const { data: userData } = useUser();
  const href = userData?.user ? PRODUCT_PATH.posts : "/signup";
  const text = userData?.user ? "Make a Post" : label;

  return (
    <Button
      asChild
      className={cn(
        "rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 h-11",
        className,
      )}
    >
      <Link href={href}>{text}</Link>
    </Button>
  );
}

function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center max-w-3xl mx-auto px-4", className)}>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TestimonialCard({
  item,
}: {
  item: (typeof TESTIMONIALS)[number];
}) {
  return (
    <div
      className={cn(
        "shrink-0 w-[300px] sm:w-[340px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm",
        "flex flex-col gap-4",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-semibold">
          {item.initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
            {item.name}
            {item.verified && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
          </p>
          <p className="text-xs text-neutral-500">{item.role}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{item.quote}</p>
      {item.visual && (
        <div
          className={cn(
            "rounded-xl h-28 bg-gradient-to-br border border-neutral-100",
            item.accent,
          )}
        >
          <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-medium">
            {item.visual === "chart" && "Growth chart preview"}
            {item.visual === "metrics" && "Performance metrics"}
            {item.visual === "product" && "AI post preview"}
          </div>
        </div>
      )}
    </div>
  );
}

export function TestimonialsSection() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-16 sm:py-24 overflow-hidden bg-neutral-50/50">
      <SectionHeading
        title="Still struggling with your next campaign?"
        subtitle="10,000+ users generate scroll-stopping posts at scale with Vimerai"
      />
      <p className="text-center mt-6 text-4xl sm:text-5xl font-bold text-neutral-900">
        10M+
      </p>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-neutral-50 to-transparent z-10" />
        <div className="flex gap-4 w-max animate-carousel-scroll py-2">
          {loop.map((item, i) => (
            <TestimonialCard key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AccountsSection() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <SectionHeading
            className="text-left max-w-none px-0"
            title="Posts-only Generation built for speed"
            subtitle="Ten Post Concepts, pick your winners, render feed-ready Social Posts with AI images — all from Brand Kit + Product context"
          />
          <ul className="mt-8 space-y-3">
            {ACCOUNT_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm text-neutral-600">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MarketingCta label="Start Free" />
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-white p-6 shadow-lg aspect-[4/3] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Post Concepts
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
              10 ready
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="rounded-lg border border-neutral-200 bg-white p-3 flex gap-3 items-center"
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-400 to-violet-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="h-2 w-3/4 rounded bg-neutral-200" />
                  <div className="h-2 w-1/2 rounded bg-neutral-100 mt-1.5" />
                </div>
                {n <= 2 && (
                  <div className="h-4 w-4 rounded border-2 border-neutral-900 bg-neutral-900 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ControlSection() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-white">
      <SectionHeading
        title="Take full control of your content outcomes"
        subtitle="Vimerai captures Brand Kit context, generates diverse Post Concepts, and remixes winners into feed-ready Social Posts — on your schedule"
      />
      <div className="max-w-6xl mx-auto mt-12 grid sm:grid-cols-3 gap-6">
        {CONTROL_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50/50 hover:shadow-md transition-shadow"
          >
            <div className="h-36 rounded-xl bg-gradient-to-br from-neutral-200/80 to-neutral-100 mb-5" />
            <h3 className="text-lg font-semibold text-neutral-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StepsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-neutral-50/80">
      <SectionHeading title="Start Vimerai in 3 steps" />
      <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <div key={step.step} className="text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white font-bold text-sm">
              {step.step}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed px-2">
              {step.body}
            </p>
            <div className="mt-6 mx-auto max-w-[220px] rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                {step.label}
              </p>
              <div className="mt-3 h-20 rounded-lg bg-gradient-to-br from-blue-50 to-violet-50" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ResultsSection() {
  const blocks = [
    {
      title: "Brand Voice",
      subtitle: "Keep tone, colors, and guardrails consistent while creating at scale.",
      mock: (
        <div className="rounded-xl border bg-white p-4 text-left text-xs space-y-2">
          <p className="font-semibold text-neutral-900">Brand Kit memory</p>
          <p className="text-neutral-500">
            <span className="text-neutral-700">Tone:</span> Clear, expert, energetic
          </p>
          <p className="text-neutral-500">
            <span className="text-neutral-700">Guardrails:</span> No hype without proof
          </p>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
          </div>
          <p className="text-neutral-400">92% brand match</p>
        </div>
      ),
    },
    {
      title: "Post Concepts",
      subtitle: "Ten alternate directions before you spend credits on a full render.",
      mock: (
        <div className="rounded-xl border bg-white p-3 text-left space-y-2">
          {["Hook A", "Hook B", "Hook C"].map((h) => (
            <div key={h} className="flex gap-2 items-center text-xs">
              <div className="h-6 w-6 rounded bg-neutral-100 shrink-0" />
              <span className="text-neutral-600">{h}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Generation library",
      subtitle: "Reopen past Generations, export Social Posts, and retry failed arms.",
      mock: (
        <div className="rounded-xl border bg-white p-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded text-[8px] flex items-center justify-center",
                i === 14 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400",
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Export ready",
      subtitle: "Know which hooks and visuals you shipped — download and post manually.",
      mock: (
        <div className="rounded-xl border bg-white p-4 text-left">
          <p className="text-xs font-semibold text-neutral-900">Growth</p>
          <div className="mt-2 flex items-end gap-1 h-16">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-violet-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4">
      <SectionHeading
        title="Everything you need to get real results"
        subtitle="Vimerai learns your brand, plans Post Concepts, tracks past Generations, and delivers export-ready Social Posts"
      />
      <div className="max-w-6xl mx-auto mt-12 grid sm:grid-cols-2 gap-6">
        {blocks.map((block) => (
          <div
            key={block.title}
            className="rounded-2xl border border-neutral-200 p-6 bg-white"
          >
            <div className="mb-5">{block.mock}</div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {block.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-500">{block.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComparisonSection() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-neutral-900 text-white">
      <SectionHeading
        className="[&_h2]:text-white [&_p]:text-neutral-400"
        title="Everything you wanted from an agency at 0.1% of the price"
        subtitle="No 6-month contracts, no monthly retainers, no agency markup — just growth"
      />
      <div className="max-w-4xl mx-auto mt-12 overflow-x-auto rounded-2xl border border-neutral-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800/50">
              <th className="text-left p-4 font-medium text-neutral-400" />
              <th className="p-4 font-medium text-neutral-300">Content Agency</th>
              <th className="p-4 font-medium text-neutral-300">Social Media Manager</th>
              <th className="p-4 font-medium text-white bg-neutral-800">Vimerai</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-neutral-800 last:border-0">
                <td className="p-4 text-neutral-400">{row.feature}</td>
                <td className="p-4 text-center text-neutral-300">{row.agency}</td>
                <td className="p-4 text-center text-neutral-300">{row.manager}</td>
                <td className="p-4 text-center font-medium text-white bg-neutral-800/80">
                  {row.vimerai}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AgentsSection() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <SectionHeading
        title="Vimerai is more than one-off posts"
        subtitle="Posts-only Generation and Make a Post / Make a Video extend your creative workflow — concepts first, export when ready"
      />
      <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-6">
        {AGENT_CARDS.map((card) => (
          <div
            key={card.title}
            className={cn(
              "rounded-2xl border border-neutral-200 p-8 bg-gradient-to-br",
              card.gradient,
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {card.tag}
            </span>
            <h3 className="mt-3 text-xl font-bold text-neutral-900">
              {card.title}
            </h3>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              {card.body}
            </p>
            <Link
              href="/signup"
              className="inline-block mt-6 text-sm font-medium text-neutral-900 hover:underline"
            >
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 px-4 bg-neutral-50/80">
      <SectionHeading title="Frequently asked questions" />
      <div className="max-w-2xl mx-auto mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {FAQ_ITEMS.map((item, i) => (
          <div key={item.q}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-neutral-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium text-neutral-900 text-sm sm:text-base">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-neutral-400 transition-transform",
                  open === i && "rotate-180",
                )}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 px-4 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
        Get started for free
      </h2>
      <p className="mt-3 text-neutral-500">Join Vimerai</p>
      <div className="mt-8">
        <MarketingCta className="h-12 px-10 text-base" />
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-12">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-bold">
              V
            </div>
            <span className="text-lg font-bold">Vimerai</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-xs">
            Skyrocket your social growth with Vimerai — create posts, pick concepts,
            export when ready.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Follow us
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>Instagram</li>
            <li>YouTube</li>
            <li>TikTok</li>
            <li>X</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Resources
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/signup" className="hover:text-neutral-900">
                Get started
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-neutral-900">
                Log in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Help & Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <p className="max-w-6xl mx-auto mt-10 pt-8 border-t border-neutral-100 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} Vimerai. All rights reserved.
      </p>
    </footer>
  );
}
