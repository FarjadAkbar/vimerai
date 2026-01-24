"use client"

import { createContext, useContext, useMemo, ReactNode } from "react"
import { useUser } from "@/lib/hooks/use-user"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"
import { Spinner } from "@/components/ui/spinner"
import { User } from "@/types"
import { CurrentSubscriptionResponse } from "../api/subscription.api"

interface AppState {
  // User data
  user: User | null
  isLoggedIn: boolean
  
  // Subscription data
  subscription: CurrentSubscriptionResponse | null
  
  // Loading states
  isLoading: boolean
  userLoading: boolean
  subscriptionLoading: boolean
  
  // Computed values
  mode: "preview" | "full"
  canGenerateVideos: boolean
}

const AppStateContext = createContext<AppState | undefined>(undefined)

interface AppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const { data: userData, isLoading: userLoading } = useUser()
  
  // 🚫 DO NOT decide auth until loading finished
  const isLoggedIn = !userLoading && !!userData?.user

  const {
    data: subscription,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription(isLoggedIn)

  // 🔐 Global auth + subscription loading gate
  const isLoading = userLoading || (userData?.user && subscriptionLoading)

  // 🔁 Decide mode ONLY after auth is ready
  const mode = useMemo(() => {
    if (!isLoggedIn) return "preview"
    return subscription?.plan === "free" ? "preview" : "full"
  }, [isLoggedIn, subscription?.plan])

  // Calculate if user can generate videos
  const canGenerateVideos = useMemo(() => {
    if (!isLoggedIn) return false
    if (!subscription) return false
    return subscription.videosRemaining > 0
  }, [isLoggedIn, subscription])

  const value: AppState = {
    user: userData?.user || null,
    isLoggedIn,
    subscription: subscription || null,
    isLoading: isLoading || false,
    userLoading,
    subscriptionLoading,
    mode,
    canGenerateVideos,
  }

  // ⛔ BLOCK ENTIRE APP until auth resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

/**
 * Hook to access global app state
 * @returns AppState object with user, subscription, and computed values
 */
export function useAppState(): AppState {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within AppStateProvider")
  }
  return context
}

/**
 * Hook to check if user is authenticated
 * @returns boolean indicating if user is logged in
 */
export function useIsAuthenticated(): boolean {
  const { isLoggedIn } = useAppState()
  return isLoggedIn
}

/**
 * Hook to get current user
 * @returns User object or null
 */
export function useCurrentUser() {
  const { user } = useAppState()
  return user
}

/**
 * Hook to get current subscription
 * @returns Subscription object or null
 */
export function useSubscription() {
  const { subscription } = useAppState()
  return subscription
}

/**
 * Hook to get generation mode
 * @returns "preview" | "full"
 */
export function useGenerationMode() {
  const { mode } = useAppState()
  return mode
}
