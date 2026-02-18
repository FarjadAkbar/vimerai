"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { subscriptionApi } from "@/lib/api/subscription.api";
import {
  useActivateMockSubscription,
  useCurrentSubscription,
} from "@/lib/hooks/use-subscription";
import { useUser } from "@/lib/hooks/use-user";

import { NotificationModal } from "@/components/notification-modal";
import type { Plan, SubscriptionPlan, PlanMap , SingleShotProduct } from "@/types/pricing.types";
import type { NotificationState } from "@/types/components.types";
import { Switch } from "@/components/ui/switch";

// Define the type for plan IDs
type PlanId = "starter" | "creator" | "pro" ;

// Features object outside component
const subscriptionFeatures: Record<PlanId, string[]> = {
  starter: [
    "Create short-form videos optimized for social media",
    "Video length up to 5 seconds",
    "HD output (up to 720p)",
    "Standard processing speed",
    "Access to basic AI styles",
    "One retry per video (technical failure only)",
    "Watermark-free videos",
    "Social media usage rights",
    "Simple monthly quota",
  ],
  creator: [
    "Create short-form videos optimized for social media",
    "Video length up to 10 seconds",
    "Full HD output (up to 1080p)",
    "Faster processing speed",
    "Access to premium AI styles",
    "Two retries per video",
    "Watermark-free videos",
    "Commercial usage rights",
    "Priority support",
  ],
  pro: [
    "Create professional videos for any platform",
    "Video length up to 30 seconds",
    "4K output (up to 2160p)",
    "Ultra-fast processing",
    "Access to all AI styles",
    "Unlimited retries",
    "Watermark-free videos",
    "Full commercial license",
    "24/7 priority support",
    "Custom branding options",
  ],
  single: [
    "One-time video generation",
    "Video length up to 5 seconds",
    "HD output (up to 720p)",
    "Standard processing speed",
    "Access to basic AI styles",
    "No retries",
    "Watermark-free video",
    "Personal usage rights",
  ],
};

export default function PricingPage() {
  const router = useRouter();
  const { data: userData } = useUser();
  const { data: currentSubscription } = useCurrentSubscription();
  const activateMockSubscription = useActivateMockSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isYearly, setIsYearly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  useEffect(() => {
    subscriptionApi
      .getPlans()
      .then((response) => {
        setPlans(response.plans);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);
const getYearlyPrice = (planPrice: number) => {
  return Math.round(planPrice * 12 * 0.85);
};

  const getFeatures = (planId: string): string[] => {
    // Convert planId to lowercase and handle variations
    const normalizedPlanId = planId.toLowerCase() as PlanId;
    return subscriptionFeatures[normalizedPlanId] || [];
  };
  
  const handleSubscribe = async (planId: string) => {
    if (!userData?.user) {
      router.push("/signup");
      return;
    }

    // Get the plan details to show video count
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    // ✅ Check if user has an active subscription with remaining videos
    if (
      currentSubscription &&
      currentSubscription.plan !== "free" &&
      currentSubscription.videosRemaining > 0
    ) {
      const currentPlanName =
        currentSubscription.plan === "creator"
          ? "AI Creator"
          : currentSubscription.plan.charAt(0).toUpperCase() +
            currentSubscription.plan.slice(1);

      const newPlanName =
        planId === "creator"
          ? "AI Creator"
          : planId.charAt(0).toUpperCase() + planId.slice(1);

      // Calculate total videos after stacking
      const totalVideos =
        currentSubscription.videosRemaining + selectedPlan.videosPerMonth;

      setNotification({
        type: "info",
        title: "Add Plan on Top",
        message: `You currently have ${currentSubscription.videosRemaining} video${currentSubscription.videosRemaining > 1 ? "s" : ""} remaining in your ${currentPlanName} plan. If you proceed, ${selectedPlan.videosPerMonth} videos from the ${newPlanName} plan will be added, giving you a total of ${totalVideos} videos.`,
        action: {
          label: "Add Plan",
          onClick: () => {
            setNotification(null);
            proceedWithSubscription(planId);
          },
        },
      });
      return;
    }

    // ✅ Proceed with subscription if no active plan or no videos remaining
    proceedWithSubscription(planId);
  };

  // ✅ Separate function for actual subscription activation
  const proceedWithSubscription = (planId: string) => {
    // Map plan ID to subscription plan type
    const planMap: PlanMap = {
      starter: "starter",
      creator: "creator",
      pro: "pro",
    };

    const plan = planMap[planId] as SubscriptionPlan;
    if (!plan) return;

    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    setActivatingPlanId(planId);
    activateMockSubscription.mutate(plan, {
      onSuccess: (data) => {
        const planDisplayName =
          data.plan === "creator"
            ? "AI Creator"
            : data.plan.charAt(0).toUpperCase() + data.plan.slice(1);

        // Calculate success message based on whether it was stacked
        const wasStacked =
          currentSubscription &&
          currentSubscription.plan !== "free" &&
          currentSubscription.videosRemaining > 0;
        const message = wasStacked
          ? `${selectedPlan.videosPerMonth} videos from ${planDisplayName} plan have been added to your account. You can now generate full videos.`
          : `${planDisplayName} plan is now active. You can now generate full videos.`;

        setNotification({
          type: "success",
          title: "Subscription Activated!",
          message: message,
          action: {
            label: "Start Generating",
            onClick: () => {
              setNotification(null);
              router.push("/");
            },
          },
        });
        setActivatingPlanId(null);
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Failed to activate subscription. Please try again.";
        setNotification({
          type: "error",
          title: "Activation Failed",
          message: message,
          action: {
            label: "Try Again",
            onClick: () => {
              setNotification(null);
              setActivatingPlanId(null);
            },
          },
        });
        setActivatingPlanId(null);
      },
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentSubscription && currentSubscription.plan !== "free"
                ? "Stack plans to add more videos to your account"
                : "Choose the plan that fits your needs."}
            </p>
            {currentSubscription && currentSubscription.plan !== "free" && (
              <div className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg">
                <span className="font-medium">Current Plan: </span>
                <span className="capitalize">
                  {currentSubscription.plan === "creator"
                    ? "AI Creator"
                    : currentSubscription.plan}
                </span>
                {/* ✅ Show remaining videos */}
                <span className="ml-2 text-sm">
                  ({currentSubscription.videosRemaining} video
                  {currentSubscription.videosRemaining !== 1 ? "s" : ""}{" "}
                  remaining)
                </span>
              </div>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-lg font-medium transition-colors ${!isYearly ? "text-primary" : "text-muted-foreground"}`}
            >
              Monthly
            </span>

            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />

            <span
              className={`text-lg font-medium transition-colors ${isYearly ? "text-primary" : "text-muted-foreground"}`}
            >
              Yearly
            </span>

            {isYearly && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                Save 15%
              </span>
            )}
          </div>

          {/* Pricing Plans */}
          {isYearly ? (
            // yearly plan
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => {
                // Check if this is the current active plan
                const isCurrentPlan =
                  currentSubscription && currentSubscription.plan === plan.id;
                
                // Check if this is the single shot plan
                const isSingleShot = plan.id === "single";

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-8 w-full ${
                      isSingleShot
                        ? "border-border bg-card"
                        : plan.popular
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border bg-card"
                    }`}
                  >
                    {plan.popular && !isSingleShot && (
                      <>
                        <BorderBeam
                          size={100}
                          duration={6}
                          colorFrom="#ffaa40"
                          colorTo="#9c40ff"
                          borderWidth={2}
                        />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full z-10">
                          Most Popular
                        </div>
                      </>
                    )}
                    {isSingleShot && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full z-10">
                        One-Time
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                        Active
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {plan.id === "starter"
                        ? "Perfect for getting started"
                        : plan.id === "creator"
                          ? "For content creators and marketers"
                          : plan.id === "pro"
                            ? "For professional creators"
                            : "One-time video generation"}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        ${isSingleShot ? plan.yearlyPrice : getYearlyPrice(plan.yearlyPrice)}
                      </span>
                      <span className="text-muted-foreground">
                        {isSingleShot ? "" : "/Year"}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.videosPerMonth} video generation{isSingleShot ? "" : "s/year"}
                        </span>
                      </li>
                      {getFeatures(plan.id).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.popular && !isSingleShot ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={activatingPlanId !== null || isCurrentPlan}
                    >
                      {activatingPlanId === plan.id
                        ? "Activating..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : currentSubscription &&
                              currentSubscription.plan !== "free"
                            ? "Stack Plan"
                            : "Start Generating"}{" "}
                    </Button>
                  </div>
                );
              })}
            </div>
          ):(
            // monthly plan
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => {
                // Check if this is the current active plan
                const isCurrentPlan =
                  currentSubscription && currentSubscription.plan === plan.id;
                
                // Check if this is the single shot plan
                const isSingleShot = plan.id === "single";

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-8 w-full ${
                      isSingleShot
                        ? "border-border bg-card"
                        : plan.popular
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border bg-card"
                    }`}
                  >
                    {plan.popular && !isSingleShot && (
                      <>
                        <BorderBeam
                          size={100}
                          duration={6}
                          colorFrom="#ffaa40"
                          colorTo="#9c40ff"
                          borderWidth={2}
                        />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full z-10">
                          Most Popular
                        </div>
                      </>
                    )}
                    {isSingleShot && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full z-10">
                        One-Time
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                        Active
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {plan.id === "starter"
                        ? "Perfect for getting started"
                        : plan.id === "creator"
                          ? "For content creators and marketers"
                          : plan.id === "pro"
                            ? "For professional creators"
                            : "One-time video generation"}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">${plan.monthlyPrice}</span>
                      <span className="text-muted-foreground">
                        {isSingleShot ? "" : "/month"}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.videosPerMonth} video generation{isSingleShot ? "" : "s/month"}
                        </span>
                      </li>
                      {getFeatures(plan.id).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.popular && !isSingleShot ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={activatingPlanId !== null || isCurrentPlan}
                    >
                      {activatingPlanId === plan.id
                        ? "Activating..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : currentSubscription &&
                              currentSubscription.plan !== "free"
                            ? "Stack Plan"
                            : "Start Generating"}{" "}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
            
        </div>
      </div>
      {/* Notification Modal */}
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
  );
}