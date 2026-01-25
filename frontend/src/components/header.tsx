"use client";
import { useLogout } from "@/lib/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/lib/hooks/use-user";
import { Crown, LogOut, Mail, Settings, Sparkles, Video } from "lucide-react";
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

  const isLoggedIn = !!userData?.user;
  const { data: subscription, isLoading: subscriptionLoading } =
    useCurrentSubscription(isLoggedIn);
  const usedVideos = subscription
    ? subscription.limit - subscription.videosRemaining
    : 0;

  const progressValue = subscription
    ? (usedVideos / subscription.limit) * 100
    : 0;

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // If clicking on current page, force reload
    if (pathname === href) {
      window.location.href = href;
      return;
    }

    router.push(href);
  }
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Vimerai</span>
        </Link>
        <div className="flex items-center gap-3">
          {userData?.user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => handleNavigation("/", e)}>
                  Generator
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => handleNavigation("/my-videos", e)}>
                  My Videos
                </Button>
                {/* <Link href="/prompt-studio" onClick={(e) => handleNavigation}>
                  <Button variant="ghost" size="sm">
                    Prompt Studio
                  </Button>
                </Link> */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={(e) => handleNavigation("/pricing", e)}
                >
                  Pricing
                </Button>
              </div>
              {/* <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-green-400 grayscale"
                  >
                    <Avatar>
                      <AvatarImage alt="shadcn" />
                      <AvatarFallback>
                        {userData.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 p-0 mr-20 my-3 rounded-2xl border border-border overflow-hidden">
                  {/* Email Section */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {userData.user.email}
                        </p>
                      
                       {
                          subscription?.plan !== 'free' && (
                            <span className="text-sm font-semibold text-yellow-600">
                              {subscription?.plan &&
                                subscription.plan.charAt(0).toUpperCase() +
                                  subscription.plan.slice(1)}
                            </span>
                          )
                        }
                        
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  {
                    subscription?.plan !== 'free' && (
                      <div className="p-4 space-y-2 border-b border-border">
                        <div className="flex items-center">
                          <p className="text-lg font-semibold">
                            {subscription?.videosRemaining}/{subscription?.limit}
                          </p>
                          <span className="text-sm text-muted-foreground mx-4">Videos Remaining</span>
                        </div>
                        <Progress
                          className="bg-gray-400 [&>div]:bg-green-600"
                          value={progressValue}
                        />
                      </div>
                   )
                  }

                 

                  {/* Menu Actions */}
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
                <Button variant="ghost" size="sm" onClick={(e) => handleNavigation("/", e)}>
                  Generator
                </Button>
                <Button variant="ghost" size="sm"  onClick={(e) => handleNavigation("/pricing", e)}>
                  Pricing
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={(e) => handleNavigation("/login", e)}>
                Sign In
              </Button>
              <Button size="sm" onClick={(e) => handleNavigation("/signup", e)} className="bg-primary hover:bg-primary/90">
                Create Account
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
