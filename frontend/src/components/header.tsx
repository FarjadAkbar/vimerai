"use client";
import { useLogout } from "@/lib/hooks/use-auth";
import { useUser } from "@/lib/hooks/use-user";
import { LogOut, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
// import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

const Header = () => {
  const logout = useLogout();
  const { data: userData } = useUser();

  const isLoggedIn = !!userData?.user;
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription(isLoggedIn);
  // Close language menu when clicking outside

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
                <Link href="/my-videos">
                  <Button variant="ghost" size="sm">
                    My Videos
                  </Button>
                </Link>
                <Link href="/prompt-studio">
                  <Button variant="ghost" size="sm">
                    Prompt Studio
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Pricing
                  </Button>
                </Link>
              </div>
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-green-400 grascale">
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 my-2"  >
                  <DropdownMenuGroup>
                    <DropdownMenuItem><span className="font-bold">Current Plan: </span> {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)}</DropdownMenuItem>
                    <DropdownMenuItem><span className="font-bold">Videos Remaining: </span> {subscription?.videosRemaining}</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/pricing">
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
