"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  Dna,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_PATH } from "@/lib/product-path";
import { useLogout } from "@/lib/hooks/use-auth";
import { useUser } from "@/lib/hooks/use-user";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: PRODUCT_PATH.posts, label: "Make a Post", icon: ImageIcon },
  { href: PRODUCT_PATH.videos, label: "Make a Video", icon: Clapperboard },
  { href: PRODUCT_PATH.businessDna, label: "Business DNA", icon: Dna },
] as const;

export function StudioSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data: subscription } = useCurrentSubscription(isLoggedIn);

  const usedVideos = subscription
    ? subscription.limit - subscription.videosRemaining
    : 0;
  const progressValue = subscription
    ? (usedVideos / subscription.limit) * 100
    : 0;

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--studio-border)] bg-[var(--studio-sidebar)] text-[var(--studio-ink)]">
      <Link
        href={PRODUCT_PATH.studio}
        className="flex shrink-0 items-center gap-2 px-4 py-5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--studio-ink)] text-white">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Vimerai</p>
          <p className="text-xs text-[var(--studio-muted)]">Brand Studio</p>
        </div>
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4">
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

      {userData?.user ? (
        <div className="mt-auto shrink-0 border-t border-[var(--studio-border)] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 rounded-lg px-2 py-2 hover:bg-[var(--studio-nav-hover)]"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="" />
                  <AvatarFallback className="bg-[var(--studio-ink)] text-xs text-white">
                    {userData.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-left text-xs text-[var(--studio-muted)]">
                  {userData.user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="start"
              className="w-72 rounded-2xl border border-border p-0"
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {userData.user.email}
                    </p>
                    {subscription?.plan !== "free" && (
                      <span className="text-sm font-semibold text-yellow-600">
                        {subscription?.plan &&
                          subscription.plan.charAt(0).toUpperCase() +
                            subscription.plan.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(subscription?.plan !== "free" ||
                (subscription?.singleShotCredits ?? 0) > 0) && (
                <div className="space-y-2 border-b border-border p-4">
                  <div className="flex items-center gap-4">
                    {subscription?.plan !== "free" && (
                      <div className="flex items-center">
                        <p className="text-lg font-semibold">
                          {subscription?.videosRemaining}/{subscription?.limit}
                        </p>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Videos
                        </span>
                      </div>
                    )}
                    {(subscription?.singleShotCredits ?? 0) > 0 && (
                      <div className="flex items-center">
                        <p className="text-lg font-semibold">
                          {subscription?.singleShotCredits}
                        </p>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Single Shot
                          {(subscription?.singleShotCredits ?? 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  {subscription?.plan !== "free" && (
                    <Progress
                      className="bg-gray-400 [&>div]:bg-green-600"
                      value={progressValue}
                    />
                  )}
                </div>
              )}

              <div className="p-2">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-red-800"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Log Out
                  </span>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </aside>
  );
}
