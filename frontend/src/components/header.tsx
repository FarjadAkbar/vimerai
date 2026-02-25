"use client";
import { useState } from "react";
import { useLogout } from "@/lib/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/lib/hooks/use-user";
import { LogOut, Mail, LayoutGrid, Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const logout = useLogout();
  const { data: userData } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!userData?.user;
  const { data: subscription } = useCurrentSubscription(isLoggedIn);
  const usedVideos = subscription
    ? subscription.limit - subscription.videosRemaining
    : 0;

  const progressValue = subscription
    ? (usedVideos / subscription.limit) * 100
    : 0;

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // If clicking on current page, force reload
    if (pathname === href) {
      window.location.href = href;
      return;
    }

    router.push(href);
  }

  const navItems = [
    { label: "Generator", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "Prompt Studio", href: "/prompt-studio" },
    ...(isLoggedIn ? [{ label: "My Videos", href: "/my-videos" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/platform/logo-vimera.png" alt="Vimera" className="h-6 sm:h-8 md:h-9 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation + Auth combined (no gap between nav and auth buttons) */}
        <div className="hidden md:flex items-center">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={pathname === item.href ? "bg-accent text-accent-foreground" : "text-white/90"}
              onClick={(e) => handleNavigation(item.href, e)}
            >
              {item.label}
            </Button>
          ))}
          {/* Auth section sits directly after nav — no gap wrapper */}
          {isLoggedIn ? null : (
            <div className="flex items-center ml-2 gap-2">
              <Button variant="outline" size="sm" onClick={(e) => handleNavigation("/login", e)}>
                Sign In
              </Button>
              <Button size="sm" onClick={(e) => handleNavigation("/signup", e)}>
                Create Account
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-green-400 grayscale"
                >
                  <Avatar>
                    <AvatarImage alt="User" />
                    <AvatarFallback>
                      {userData?.user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-80 p-0 mr-20 my-3 rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userData?.user?.email}
                      </p>
                      {subscription?.plan !== 'free' && (
                        <span className="text-sm font-semibold text-yellow-500">
                          {subscription?.plan &&
                            subscription.plan.charAt(0).toUpperCase() +
                              subscription.plan.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(subscription?.plan !== "free" || (subscription?.singleShotCredits ?? 0) > 0) && (
                  <div className="p-4 space-y-2 border-b border-border text-white">
                    <div className="flex items-center gap-4">
                      {subscription?.plan !== "free" && (
                        <div className="flex items-center">
                          <p className="text-lg font-semibold">
                            {subscription?.videosRemaining}/{subscription?.limit}
                          </p>
                          <span className="text-sm text-muted-foreground ml-2">Videos</span>
                        </div>
                      )}
                      {(subscription?.singleShotCredits ?? 0) > 0 && (
                        <div className="flex items-center">
                          <p className="text-lg font-semibold">
                            {subscription?.singleShotCredits}
                          </p>
                          <span className="text-sm text-muted-foreground ml-2">
                            Single Shot{(subscription?.singleShotCredits ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    {subscription?.plan !== "free" && (
                      <Progress
                        className="bg-gray-700 [&>div]:bg-green-600 h-1.5"
                        value={progressValue}
                      />
                    )}
                  </div>
                )}

                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 justify-center px-3 py-2.5 rounded-xl hover:bg-red-800 transition-colors text-left cursor-pointer text-white"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white w-9 h-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <LayoutGrid className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-3 pb-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-white/80 hover:bg-accent/40 hover:text-white"
                }`}
                onClick={(e) => handleNavigation(item.href, e)}
              >
                {item.label}
              </button>
            ))}
            {!isLoggedIn && (
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="outline" className="w-full" onClick={(e) => handleNavigation("/login", e)}>
                  Sign In
                </Button>
                <Button className="w-full" onClick={(e) => handleNavigation("/signup", e)}>
                  Create Account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
