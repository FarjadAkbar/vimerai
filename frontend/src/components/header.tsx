"use client";
import { useLogout } from "@/lib/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/lib/hooks/use-user";
import { LogOut, Mail, LayoutGrid, Menu, X } from "lucide-react";
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
import { useState } from "react";
import { PRODUCT_PATH } from "@/lib/product-path";

const Header = () => {
  const logout = useLogout();
  const { data: userData } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!userData?.user;
  const { data: subscription, isLoading: subscriptionLoading } =
    useCurrentSubscription(isLoggedIn);
  const usedVideos = subscription
    ? subscription.limit - subscription.videosRemaining
    : 0;

  const progressValue = subscription
    ? (usedVideos / subscription.limit) * 100
    : 0;

  const homeHref = isLoggedIn ? PRODUCT_PATH.studio : "/";
  const inStudio = pathname.startsWith("/studio");

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (pathname === href) {
      window.location.href = href;
      return;
    }

    router.push(href);
  };

  // Brand Studio owns its own full-height rail (logo + nav + account).
  if (inStudio) {
    return null;
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="logo-fallback hidden w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-6">
              <img
                src="/platform/logo-vimera.png"
                alt="Vimera"
                className="h-6 sm:h-9 md:h-9 w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {userData?.user ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.studio, e)
                    }
                  >
                    Brand Studio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.posts, e)
                    }
                  >
                    Make a Post
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.videos, e)
                    }
                  >
                    Make a Video
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.businessDna, e)
                    }
                  >
                    Business DNA
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.brands, e)
                    }
                  >
                    Brands
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleNavigation(PRODUCT_PATH.products, e)
                    }
                  >
                    Products
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white"
                    onClick={(e) => handleNavigation("/pricing", e)}
                  >
                    Pricing
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-gray-600 w-7 h-7"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage alt="shadcn" />
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
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
                      <div className="p-4 space-y-2 border-b border-border">
                        <div className="flex items-center gap-4">
                          {subscription?.plan !== "free" && (
                            <div className="flex items-center">
                              <p className="text-lg font-semibold">
                                {subscription?.videosRemaining}/
                                {subscription?.limit}
                              </p>
                              <span className="text-sm text-muted-foreground ml-2">
                                Videos
                              </span>
                            </div>
                          )}
                          {(subscription?.singleShotCredits ?? 0) > 0 && (
                            <div className="flex items-center">
                              <p className="text-lg font-semibold">
                                {subscription?.singleShotCredits}
                              </p>
                              <span className="text-sm text-muted-foreground ml-2">
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
                        className="w-full flex items-center gap-3 justify-center px-3 py-2.5 rounded-xl hover:bg-red-800 transition-colors text-left cursor-pointer"
                        onClick={logout}
                      >
                        <LogOut className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Log Out
                        </span>
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleNavigation("/login", e)}
                  >
                    Brand Studio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleNavigation("/pricing", e)}
                  >
                    Pricing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleNavigation("/login", e)}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => handleNavigation("/signup", e)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign up
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 z-40 border-b border-border backdrop-blur-md bg-background/95 shadow-lg">
          <div className="flex flex-col px-4 py-3 gap-1">
            {userData?.user ? (
              <>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) =>
                    handleNavigation(PRODUCT_PATH.studio, e)
                  }
                >
                  Brand Studio
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) => handleNavigation(PRODUCT_PATH.posts, e)}
                >
                  Make a Post
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) =>
                    handleNavigation(PRODUCT_PATH.videos, e)
                  }
                >
                  Make a Video
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) =>
                    handleNavigation(PRODUCT_PATH.businessDna, e)
                  }
                >
                  Business DNA
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) =>
                    handleNavigation(PRODUCT_PATH.brands, e)
                  }
                >
                  Brands
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) =>
                    handleNavigation(PRODUCT_PATH.products, e)
                  }
                >
                  Products
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) => handleNavigation("/pricing", e)}
                >
                  Pricing
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) => handleNavigation("/login", e)}
                >
                  Brand Studio
                </button>
                <button
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={(e) => handleNavigation("/pricing", e)}
                >
                  Pricing
                </button>
                <div className="border-t border-border my-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={(e) => handleNavigation("/login", e)}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="w-full justify-center mt-2 bg-primary hover:bg-primary/90"
                  onClick={(e) => handleNavigation("/signup", e)}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
