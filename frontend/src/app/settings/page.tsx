"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle, CreditCard } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUser, useUpdateUser } from "@/lib/hooks/use-user"
import { useCurrentSubscription, useCancelSubscription } from "@/lib/hooks/use-subscription"
import { NotificationModal } from "@/components/notification-modal"
import { useState } from "react"
import { updateUserSchema, type UpdateUserInput } from "@/lib/auth/schema"
import type { NotificationState } from "@/types/components.types"

export default function SettingsPage() {
  const { data: userData } = useUser()
  const updateUser = useUpdateUser()
  const { data: currentSubscription } = useCurrentSubscription()
  const cancelSubscription = useCancelSubscription()
  const [successMessage, setSuccessMessage] = useState("")
  const [notification, setNotification] = useState<NotificationState | null>(null)

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: userData?.user?.email || "",
    },
  })

  const onSubmit = async (data: UpdateUserInput) => {
    updateUser.mutate(data, {
      onSuccess: () => {
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to update profile. Please try again."
        form.setError("root", { message })
      },
    })
  }

  const handleCancelSubscription = () => {
    setNotification({
      type: "warning",
      title: "Cancel Subscription",
      message:
        "Are you sure you want to cancel your subscription? You will lose access to your remaining videos at the end of the current billing period.",
      action: {
        label: "Yes, Cancel",
        onClick: () => {
          setNotification(null)
          cancelSubscription.mutate(undefined, {
            onSuccess: () => {
              setNotification({
                type: "success",
                title: "Subscription Cancelled",
                message:
                  "Your subscription has been cancelled. You can resubscribe at any time.",
              })
            },
            onError: () => {
              setNotification({
                type: "error",
                title: "Cancellation Failed",
                message:
                  "We could not cancel your subscription. Please try again or contact support.",
              })
            },
          })
        },
      },
    })
  }

  const planDisplayName = (plan: string) =>
    plan === "creator" ? "AI Creator" : plan.charAt(0).toUpperCase() + plan.slice(1)

  const hasActiveSubscription =
    currentSubscription &&
    currentSubscription.plan !== "free" &&
    currentSubscription.videosRemaining > 0

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="w-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>{form.formState.errors.root.message}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Profile Section */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            disabled={updateUser.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={updateUser.isPending}
                  >
                    <Save className="w-5 h-5" />
                    {updateUser.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                {/* Account Section */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Account</h2>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">User ID</p>
                        <p className="text-sm text-muted-foreground">{userData?.user?.id || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-border">
                      <div>
                        <p className="font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {userData?.user?.createdAt
                            ? new Date(userData.user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>

            {/* Subscription Section */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Subscription</h2>
              </div>

              {hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="text-lg font-semibold">
                        {planDisplayName(currentSubscription.plan)}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
                      Active
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Videos Remaining</p>
                      <p className="text-lg font-semibold">
                        {currentSubscription.videosRemaining}
                      </p>
                    </div>
                    {(currentSubscription.singleShotCredits ?? 0) > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Single Shot Credits</p>
                        <p className="text-lg font-semibold">
                          {currentSubscription.singleShotCredits}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscription.isPending}
                    >
                      {cancelSubscription.isPending ? "Cancelling..." : "Cancel Plan"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    {(currentSubscription?.singleShotCredits ?? 0) > 0
                      ? `You have ${currentSubscription?.singleShotCredits} Single Shot credit${(currentSubscription?.singleShotCredits ?? 0) !== 1 ? "s" : ""} available`
                      : "You don't have an active subscription"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/pricing")}
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <NotificationModal
          open={!!notification}
          onClose={() => setNotification(null)}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          action={notification.action}
          autoClose={notification.type === "success" ? 3000 : 0}
        />
      )}
    </>
  )
}
