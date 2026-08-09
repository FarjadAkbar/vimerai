"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  Dna,
  ImageIcon,
  LayoutGrid,
  Package,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_PATH } from "@/lib/product-path";

const navItems = [
  { href: PRODUCT_PATH.posts, label: "Make a Post", icon: ImageIcon },
  { href: PRODUCT_PATH.videos, label: "Make a Video", icon: Clapperboard },
  { href: PRODUCT_PATH.businessDna, label: "Business DNA", icon: Dna },
  { href: PRODUCT_PATH.brands, label: "Brands", icon: Sparkles },
  { href: PRODUCT_PATH.products, label: "Products", icon: Package },
] as const;

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--studio-border)] bg-[var(--studio-sidebar)] text-[var(--studio-ink)]">
      <Link
        href={PRODUCT_PATH.studio}
        className="flex items-center gap-2 px-4 py-5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--studio-ink)] text-white">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Vimerai</p>
          <p className="text-xs text-[var(--studio-muted)]">Brand Studio</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Brand Studio
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--studio-nav-active)] font-medium text-[var(--studio-ink)]"
                  : "text-[var(--studio-muted)] hover:bg-[var(--studio-nav-hover)] hover:text-[var(--studio-ink)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
