"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUser, useUpdateUser } from "@/lib/hooks/use-user"
import { useState } from "react"
import { updateUserSchema, type UpdateUserInput } from "@/lib/auth/schema"
import Header from "@/components/header"

export default function SettingsPage() {
  const { data: userData } = useUser()
  const updateUser = useUpdateUser()
  const [successMessage, setSuccessMessage] = useState("")

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

  return (
    <>
      <Header />
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
          </div>
        </div>
      </div>
    </>
  )
}
