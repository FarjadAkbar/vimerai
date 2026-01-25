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
import { usePathname } from "next/navigation";

const Header = () => {
  const logout = useLogout();
  const { data: userData } = useUser();
  const pathname = usePathname();

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
                <Link href="/" onClick={(e) => handleNavigation("/", e)}>
                  <Button variant="ghost" size="sm">
                    Generator
                  </Button>
                </Link>
                <Link href="/my-videos" onClick={(e) => handleNavigation("/my-videos", e)}>
                  <Button variant="ghost" size="sm">
                    My Videos
                  </Button>
                </Link>
                {/* <Link href="/prompt-studio" onClick={(e) => handleNavigation}>
                  <Button variant="ghost" size="sm">
                    Prompt Studio
                  </Button>
                </Link> */}
                <Link href="/pricing" onClick={(e) => handleNavigation("/pricing", e)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Pricing
                  </Button>
                </Link>
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
                      
                      <span className="text-sm font-semibold text-yellow-600">
                        {subscription?.plan &&
                          subscription.plan.charAt(0).toUpperCase() +
                            subscription.plan.slice(1)}
                      </span>
                        
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="p-4 space-y-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      {/* <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Videos Remaining
                        </span>
                      </div> */}
                    </div>
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
                <Link href="/" onClick={(e) => handleNavigation("/", e)}>
                  <Button variant="ghost" size="sm">
                    Generator
                  </Button>
                </Link>
                <Link href="/pricing" onClick={(e) => handleNavigation("/pricing", e)}>
                  <Button variant="ghost" size="sm">
                    Pricing
                  </Button>
                </Link>
              </div>

              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
