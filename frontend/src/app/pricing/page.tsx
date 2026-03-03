"use client";

// Plans, pricing, and features are defined on the frontend. Backend keeps limit + plan name + currency for restrictions only.
// Do not expose any third-party provider names in UI or user-facing text.

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  useCurrentSubscription,
  usePricingRegion,
  useCreateCheckout,
  useCreateSingleShotCheckout,
  useCaptureSingleShot,
  useActivateSubscription,
} from "@/lib/hooks/use-subscription";
import { useUser } from "@/lib/hooks/use-user";
import { NotificationModal } from "@/components/notification-modal";
import type {
  Plan,
  SubscriptionPlan,
  PlanMap,
  BillingPeriod,
} from "@/types/pricing.types";
import type { SubscriptionPlan as ApiSubscriptionPlan } from "@/lib/api/subscription.api";
import type { NotificationState } from "@/types/components.types";

type PlanId = 'starter' | 'creator' | 'pro' | 'singleShot';
type PricingRegionKey = 'global' | 'mea';

const YEARLY_DISCOUNT = 0.15;

/** Monthly prices by region. Backend resolves PayPal plan IDs by region. */
const MONTHLY_PRICES_BY_REGION: Record<PricingRegionKey, Record<string, number>> = {
  global: { starter: 42, creator: 79, pro: 149 },
  mea: { starter: 35, creator: 69, pro: 129 },
};

function yearlyFromMonthly(monthly: number): number {
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));
}

// Plan definitions (limits/names). Prices come from MONTHLY_PRICES_BY_REGION based on API region.
const SUBSCRIPTION_PLANS_BASE: Omit<Plan, 'monthlyPrice' | 'yearlyPrice'>[] = [
  { id: 'starter', name: 'AI Starter', videosPerMonth: 25, popular: false },
  { id: 'creator', name: 'AI Creator', videosPerMonth: 35, popular: true },
  { id: 'pro', name: 'AI Pro Studio', videosPerMonth: 60, popular: false },
];

function buildPlansForRegion(region: PricingRegionKey): Plan[] {
  const prices = MONTHLY_PRICES_BY_REGION[region];
  return SUBSCRIPTION_PLANS_BASE.map((plan) => {
    const monthly = prices[plan.id] ?? 0;
    return { ...plan, monthlyPrice: monthly, yearlyPrice: yearlyFromMonthly(monthly) };
  });
}



// Feature bullets must match final spec; first line (videos per month) is shown from API.
const subscriptionFeatures: Record<PlanId, string[]> = {
  starter: [
    "25 videos per month",
    "Up to 5 seconds per video",
    "HD output (720p)",
    "No watermark",
  ],
  creator: [
    "35 videos per month",
    "Up to 10 seconds per video",
    "Full HD output (1080p)",
    "No watermark",
  ],
  pro: [
    "60 videos per month",
    "Up to 15 seconds per video",
    "Full HD output (1080p)",
    "No watermark",
  ],
  singleShot: []
};

/** Show rounded prices only (no decimals like 1009.8). */
function formatPrice(value: number): string {
  return String(Math.round(Number(value)));
}

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: userData } = useUser();
  const { data: currentSubscription } = useCurrentSubscription();
  const { data: pricingRegion } = usePricingRegion();
  const createCheckout = useCreateCheckout();
  const createSingleShotCheckout = useCreateSingleShotCheckout();
  const captureSingleShot = useCaptureSingleShot();
  const activateSubscription = useActivateSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const paypalCaptureAttempted = useRef(false);
  const subscriptionActivateAttempted = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const paypalSuccess = searchParams.get("paypal") === "success";
    if (!token || !paypalSuccess || paypalCaptureAttempted.current) return;

    paypalCaptureAttempted.current = true;
    captureSingleShot.mutate(token, {
      onSuccess: (data) => {
        if (data?.singleShotCredits != null) {
          window.history.replaceState({}, "", "/pricing");
          setNotification({
            type: "success",
            title: "Single Shot Purchased",
            message: `You now have ${data.singleShotCredits} credit${data.singleShotCredits !== 1 ? "s" : ""}. Each credit = one video. Buy again anytime to add more.`,
            action: {
              label: "Start Generating",
              onClick: () => {
                setNotification(null);
                router.push("/");
              },
            },
          });
        }
      },
      onError: () => {
        paypalCaptureAttempted.current = false;
        window.history.replaceState({}, "", "/pricing");
        setNotification({
          type: "error",
          title: "Capture Failed",
          message: "We could not complete your purchase. Please contact support if you were charged.",
        });
      },
    });
  }, [searchParams, captureSingleShot, router]);

  const getFeatures = (planId: string): string[] => {
    const normalizedPlanId = planId.toLowerCase() as PlanId;
    return subscriptionFeatures[normalizedPlanId] || [];
  };
 


  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");
    const subSuccess = searchParams.get("subscription") === "success";
    if (!subscriptionId || !subSuccess || subscriptionActivateAttempted.current) return;

    subscriptionActivateAttempted.current = true;
    activateSubscription.mutate(subscriptionId, {
      onSuccess: (data) => {
        if (data?.plan) {
          window.history.replaceState({}, "", "/pricing");
          const planDisplayNames: Record<string, string> = {
            starter: "AI Starter",
            creator: "AI Creator",
            pro: "AI Pro Studio",
          };
          const planName = planDisplayNames[data.plan] ?? data.plan;
          setNotification({
            type: "success",
            title: "Subscription Activated",
            message: `${planName} plan is now active. You can now generate full videos.`,
            action: {
              label: "Start Generating",
              onClick: () => {
                setNotification(null);
                router.push("/");
              },
            },
          });
        }
      },
      onError: () => {
        subscriptionActivateAttempted.current = false;
        window.history.replaceState({}, "", "/pricing");
        setNotification({
          type: "error",
          title: "Activation Failed",
          message: "We could not activate your subscription. Please contact support if you were charged.",
        });
      },
    });
  }, [searchParams, activateSubscription, router]);

  // Sync billing period toggle to current subscription when user has one
  useEffect(() => {
    if (
      currentSubscription?.billingPeriod &&
      currentSubscription.plan !== "free"
    ) {
      setBillingPeriod(currentSubscription.billingPeriod);
    }
  }, [currentSubscription?.plan, currentSubscription?.billingPeriod]);

  const regionKey: PricingRegionKey = pricingRegion?.region ?? "global";
  const plans = useMemo(() => buildPlansForRegion(regionKey), [regionKey]);
  const SINGLE_SHOT = { id: 'single-shot', name: 'AI Single Shot', type: 'one-time' as const, videosIncluded: 1, price: regionKey==='mea'?15:18 };
  const singleShot = SINGLE_SHOT;

  const getSingleShotFeatures = () => [
    "1 video generation",
    "Up to 10 seconds",
    "HD output (720p)",
    "No watermark",
  ];

  const handleSubscribe = async (planId: string) => {
    if (!userData?.user) {
      router.push("/signup");
      return;
    }
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    if (
      currentSubscription &&
      currentSubscription.plan !== "free" &&
      currentSubscription.videosRemaining > 0
    ) {
      const planDisplayNames: Record<string, string> = {
        starter: "AI Starter",
        creator: "AI Creator",
        pro: "AI Pro Studio",
      };
      const currentPlanName = planDisplayNames[currentSubscription.plan] ?? currentSubscription.plan;
      const newPlanName = planDisplayNames[planId] ?? planId;
      const totalVideos = currentSubscription.videosRemaining + selectedPlan.videosPerMonth;

      setNotification({
        type: "info",
        title: "Add Plan on Top",
        message: `You currently have ${currentSubscription.videosRemaining} video${currentSubscription.videosRemaining !== 1 ? "s" : ""} remaining in your ${currentPlanName} plan. If you proceed, ${selectedPlan.videosPerMonth} videos from the ${newPlanName} plan will be added, giving you a total of ${totalVideos} videos.`,
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
    proceedWithSubscription(planId);
  };

  const proceedWithSubscription = (planId: string) => {
    const planMap: PlanMap = {
      starter: "starter",
      creator: "creator",
      pro: "pro",
    };
    const plan = planMap[planId] as SubscriptionPlan;
    if (!plan) return;

    setActivatingPlanId(planId);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const successUrl = `${origin}/pricing?subscription=success`;
    const cancelUrl = `${origin}/pricing`;
    createCheckout.mutate(
      { plan: plan as ApiSubscriptionPlan, billingPeriod, successUrl, cancelUrl },
      { onSettled: () => setActivatingPlanId(null) },
    );
  };

  const handlePurchaseSingleShot = () => {
    if (!userData?.user) {
      router.push("/signup");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const successUrl = `${origin}/pricing?paypal=success`;
    const cancelUrl = `${origin}/pricing`;
    createSingleShotCheckout.mutate({ successUrl, cancelUrl });
  };

  const getPlanDescription = (planId: string) => {
    if (planId === "starter") return "Create short-form videos optimized for social media";
    if (planId === "creator") return "Create short-form videos for social platforms (Most Popular)";
    if (planId === "pro") return "Create high-impact short-form videos for ads & campaigns";
    return "";
  };

 return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentSubscription && currentSubscription.plan !== "free"
                ? "Stack plans to add more videos to your account"
                : "Choose the plan that fits your needs"}
            </p>
            {currentSubscription?.plan && currentSubscription.plan !== "free" && (
              <div className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg">
                <span className="font-medium">Current Plan: </span>
                <span>
                  {currentSubscription.plan === "starter"
                    ? "AI Starter"
                    : currentSubscription.plan === "creator"
                      ? "AI Creator"
                      : currentSubscription.plan === "pro"
                        ? "AI Pro Studio"
                        : currentSubscription.plan}
                </span>
                {(currentSubscription?.videosRemaining ?? 0) > 0 && (
                  <span className="ml-2 text-sm">
                    ({currentSubscription?.videosRemaining} video
                    {currentSubscription?.videosRemaining !== 1 ? "s" : ""}{" "}
                    remaining)
                  </span>
                )}
                {(currentSubscription?.singleShotCredits ?? 0) > 0 && (
                  <span className="ml-2 text-sm">
                    {currentSubscription?.singleShotCredits} Single Shot
                    {(currentSubscription?.singleShotCredits ?? 0) !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Billing toggle: Monthly / Yearly */}
          {plans.length > 0 && (
            <div className="flex justify-center mb-10">
              <div
                role="group"
                aria-label="Billing period"
                className="inline-flex rounded-lg border border-input bg-muted p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    billingPeriod === "monthly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    billingPeriod === "yearly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Save 15%
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Subscription plan cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => {
              const effectiveBillingPeriod = currentSubscription?.billingPeriod ?? 'monthly';
              const isCurrentPlan =
                currentSubscription &&
                currentSubscription.plan !== 'free' &&
                currentSubscription.plan === plan.id &&
                effectiveBillingPeriod === billingPeriod;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-6 flex flex-col transition-all duration-300 ${
                    isCurrentPlan
                      ? "border-[#470BC1]/50 bg-[#470BC1]/5 ring-1 ring-[#470BC1]/20"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  {plan.popular && (
                    <BorderBeam
                      size={100}
                      duration={6}
                      colorFrom="#ffaa40"
                      className="opacity-60"
                      colorTo="#9c40ff"
                      borderWidth={2}
                    />
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-[#470BC1] text-white text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-lg">
                      Active
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                  <p className="text-muted-foreground text-sm mb-4 min-h-[40px]">
                    {getPlanDescription(plan.id)}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${formatPrice(billingPeriod === "monthly"
                        ? plan.monthlyPrice
                        : plan.yearlyPrice)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                   <Button
                    className={`w-full mb-6 font-semibold transition-all duration-300 ${
                      isCurrentPlan 
                        ? "bg-secondary text-secondary-foreground cursor-default" 
                        : "bg-white text-black hover:bg-[#470BC1] hover:text-white"
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={activatingPlanId !== null || !!isCurrentPlan}
                  >
                    {activatingPlanId === plan.id 
                      ? "Redirecting..."
                      : isCurrentPlan
                        ? "Active Plan"
                        : "Subscribe Now"}
                  </Button>

                  <ul className="space-y-3 flex-1">
                    {getFeatures(plan.id).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Single Shot card — outside grid so it can be centered */}
          {singleShot && (
            <div className="flex justify-center mt-6">
              <div className="relative rounded-xl border-2 border-[#470BC1] bg-card p-6 flex flex-col w-full max-w-sm">
                {(currentSubscription?.singleShotCredits ?? 0) > 0 && (
                  <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                    {currentSubscription?.singleShotCredits} Credits
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{singleShot.name}</h3>

                <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                  One-time purchase. One short-form video, no expiration
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${formatPrice(singleShot.price)}
                  </span>
                  <span className="text-muted-foreground text-sm"> /one-time</span>
                </div>

                <Button
                  className="w-full mb-6 bg-white text-black hover:bg-[#470BC1] hover:text-white font-semibold transition-all duration-300"
                  onClick={handlePurchaseSingleShot}
                  disabled={createSingleShotCheckout.isPending}
                >
                  {createSingleShotCheckout.isPending
                    ? "Redirecting..."
                    : "Purchase Credit"}
                </Button>

                <ul className="space-y-3 flex-1">
                  {getSingleShotFeatures().map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
  );
}