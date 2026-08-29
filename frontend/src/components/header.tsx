"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useLogout } from "@/lib/hooks/use-auth";
import { useUser } from "@/lib/hooks/use-user";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { PRODUCT_PATH } from "@/lib/product-path";

const MARKETING_PATHS = ["/", "/login", "/signup", "/password-reset"];

function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          dark
            ? "bg-neutral-900 text-white"
            : "bg-white text-neutral-900 ring-1 ring-neutral-200"
        }`}
      >
        V
      </div>
      <span
        className={`text-lg font-bold tracking-tight ${
          dark ? "text-neutral-900" : "text-white"
        }`}
      >
        Vimerai
      </span>
    </div>
  );
}

const Header = () => {
  const logout = useLogout();
  const { data: userData } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!userData?.user;
  const isMarketing = MARKETING_PATHS.includes(pathname);
  const inStudio = pathname.startsWith("/studio");

  const { data: subscription } = useCurrentSubscription(isLoggedIn);
  const usedVideos = subscription
    ? subscription.limit - subscription.videosRemaining
    : 0;
  const progressValue = subscription
    ? (usedVideos / subscription.limit) * 100
    : 0;

  const homeHref = "/";

  const navigate = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  if (inStudio) {
    return null;
  }

  if (isMarketing) {
    return (
      <>
        <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
            <Link href={homeHref}>
              <BrandLogo dark />
            </Link>

            <div className="flex items-center gap-2 ml-auto">
              {isLoggedIn ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-8 h-8"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarImage alt="" />
                          <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs">
                            {userData.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 p-0 mr-4 rounded-2xl">
                      <div className="p-4 border-b">
                        <p className="text-sm font-medium truncate">
                          {userData.user.email}
                        </p>
                      </div>
                      {subscription?.plan !== "free" && (
                        <div className="p-4 border-b space-y-2">
                          <p className="text-sm">
                            {subscription?.videosRemaining}/{subscription?.limit}{" "}
                            credits
                          </p>
                          <Progress value={progressValue} className="h-1.5" />
                        </div>
                      )}
                      <div className="p-2">
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex text-neutral-700"
                    onClick={() => navigate("/login")}
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-4"
                    onClick={() => navigate("/signup")}
                  >
                    Start Free Trial
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </nav>

        {mobileMenuOpen && !isLoggedIn && (
          <div className="md:hidden fixed top-14 left-0 right-0 z-40 border-b border-neutral-200 bg-white shadow-lg">
            <div className="flex flex-col p-4 gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button
                className="w-full rounded-full bg-neutral-900"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="logo-fallback hidden w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="w-5 h-5 text-primary-foreground" />
            </div>
            <BrandLogo dark />
          </Link>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(PRODUCT_PATH.studio)}
                  >
                    Brand Studio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(PRODUCT_PATH.blitz)}
                  >
                    Blitz
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(PRODUCT_PATH.videos)}
                  >
                    Viral Remix
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(PRODUCT_PATH.businessDna)}
                  >
                    Business DNA
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-gray-600 w-7 h-7"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage alt="" />
                        <AvatarFallback>
                          {userData.user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0 mr-4 md:mr-20 my-3 rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium truncate">
                          {userData.user.email}
                        </p>
                      </div>
                    </div>
                    {subscription?.plan !== "free" && (
                      <div className="p-4 space-y-2 border-b border-border">
                        <p className="text-lg font-semibold">
                          {subscription?.videosRemaining}/{subscription?.limit}
                        </p>
                        <Progress value={progressValue} />
                      </div>
                    )}
                    <div className="p-2">
                      <button
                        className="w-full flex items-center gap-3 justify-center px-3 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
                        onClick={logout}
                      >
                        <LogOut className="w-5 h-5" />
                        Log Out
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
