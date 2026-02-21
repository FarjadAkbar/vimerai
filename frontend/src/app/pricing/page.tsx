"use client";

// Plans, pricing, and features are defined on the frontend. Backend keeps limit + plan name + currency for restrictions only.
// Do not expose any third-party provider names in UI or user-facing text.

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  useCurrentSubscription,
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

// PayPal billing plan IDs by region (pricing managed on PayPal). Add Pro Yearly for global when created.
type PricingRegion = 'global' | 'mea';
const PAYPAL_PLAN_IDS: Record<PricingRegion, Record<string, string>> = {
  global: {
    'starter-monthly': 'P-5RB13907GD995821JNGIBRNY',
    'starter-yearly': 'P-47G2072900228090SNGIBRVQ',
    'creator-monthly': 'P-2NY89093PP844033WNGIBR3I',
    'creator-yearly': 'P-84P92151Y06445051NGIBSCQ',
    'pro-monthly': 'P-2436777566582301GNGIBSII',
    'pro-yearly': '', // Add when Pro Yearly is created in PayPal
  },
  mea: {
    'starter-monthly': 'P-9XX436710M2019608NGMY6SI',
    'starter-yearly': 'P-6CE45123R0141430BNGMY6PI',
    'creator-monthly': 'P-3KU15133MU8595837NGMY6MI',
    'creator-yearly': 'P-2B2535621A749143CNGMY6JA',
    'pro-monthly': 'P-01W64641HT0541055NGMY6DQ',
    'pro-yearly': 'P-656176366S7907807NGMY57Y',
  },
};

const DEFAULT_PRICING_REGION: PricingRegion = 'global';

// Static plan definitions (frontend). Limits must match backend for restriction logic.
const YEARLY_DISCOUNT = 0.15;
const SUBSCRIPTION_PLANS: Plan[] = [
  { id: 'starter', name: 'AI Starter', videosPerMonth: 3, monthlyPrice: 12, yearlyPrice: Math.round(12 * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100, popular: false },
  { id: 'creator', name: 'AI Creator', videosPerMonth: 6, monthlyPrice: 35, yearlyPrice: Math.round(35 * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100, popular: true },
  { id: 'pro', name: 'AI Pro Studio', videosPerMonth: 10, monthlyPrice: 99, yearlyPrice: Math.round(99 * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100, popular: false },
];
const SINGLE_SHOT = { id: 'single-shot', name: 'AI Single Shot', type: 'one-time' as const, videosIncluded: 1, price: 10 };

// Feature bullets must match final spec; first line (videos per month) is shown from API.
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
    "Create short-form videos optimized for social platforms",
    "Video length up to 10 seconds",
    "Full HD output (up to 1080p)",
    "Fast processing speed",
    "Access to advanced AI styles",
    "Built-in sound & effects library",
    "Enhanced visual quality",
    "One retry per video",
    "Watermark-free videos",
    "Full publishing & commercial usage rights",
    "Priority customer support",
  ],
  pro: [
    "Create high-impact short-form videos for ads & campaigns",
    "Video length up to 15 seconds",
    "Premium Full HD output (up to 1080p)",
    "Ultra-fast processing speed",
    "Access to cinematic AI styles",
    "Full sound & effects library",
    "Enhanced visual quality for professional use",
    "One retry per video",
    "Watermark-free videos",
    "Full commercial usage rights",
    "VIP customer support",
  ],
  singleShot: [],
};

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: userData } = useUser();
  const { data: currentSubscription } = useCurrentSubscription();
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
            message: `You now have ${data.singleShotCredits} credit${data.singleShotCredits !== 1 ? "s" : ""}. Use it anytime to generate one video. No expiration.`,
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

  const plans = SUBSCRIPTION_PLANS;
  const singleShot = SINGLE_SHOT;

  const getSingleShotFeatures = () => [
    "Create one short-form video",
    "Video length up to 10 seconds",
    "HD output (up to 720p)",
    "Standard processing speed",
    "Access to basic AI styles",
    "No free retry",
    "Watermark-free video",
    "Full usage rights",
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

    const regionPlans = PAYPAL_PLAN_IDS[DEFAULT_PRICING_REGION];
    const key = `${planId}-${billingPeriod}` as keyof typeof regionPlans;
    const paypalPlanId = regionPlans[key];
    if (!paypalPlanId) {
      setNotification({
        type: "error",
        title: "Checkout unavailable",
        message: `PayPal plan for ${planId} (${billingPeriod}) is not configured for this region.`,
      });
      return;
    }

    setActivatingPlanId(planId);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const successUrl = `${origin}/pricing?subscription=success`;
    const cancelUrl = `${origin}/pricing`;
    createCheckout.mutate(
      { plan: plan as ApiSubscriptionPlan, billingPeriod, paypalPlanId, successUrl, cancelUrl },
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
              Simple, Transparent Pricing
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

          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto items-stretch">
              {/* ── Subscription plan cards ── */}
              {plans.map((plan, index) => {  // ✅ index added here
                const isCurrentPlan =
                  currentSubscription && currentSubscription.plan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-6 flex flex-col ${
                      isCurrentPlan
                        ? "border-[#63489c] border-4"
                        : "border-border bg-card"
                    }`}
                  >
                    {/* Badges */}
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
                      <div className="absolute -top-4 right-4 px-3 py-1 bg-[#63489c] text-white text-xs font-medium rounded-full z-10">
                        Active
                      </div>
                    )}

                    {/* ROW 1 — Plan name */}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                    {/* ROW 2 — Description */}
                    <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                      {getPlanDescription(plan.id)}
                    </p>

                    {/* ROW 3 — Price (frontend); limits must match backend for restrictions */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        &euro;{billingPeriod === "monthly"
                          ? plan.monthlyPrice.toFixed(2)
                          : plan.yearlyPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /{billingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>

                    {/* ROW 4 — CTA button */}
                    <Button
                      className={`w-full mb-6 bg-white text-black hover:bg-gray-100 ${
                        isCurrentPlan ? "bg-white text-black" : ""
                      }`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={activatingPlanId !== null || !!isCurrentPlan}
                    >
                      {activatingPlanId === plan.id
                        ? "Redirecting to checkout..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : "Subscribe"}
                    </Button>

                    {/* ROW 5 — Features */}
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.videosPerMonth} video generations/month
                        </span>
                      </li>
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

              {/* ── Single Shot card ── */}
              {singleShot && (
                <div className="relative rounded-xl border-2 border-blue-400 bg-card p-6 flex flex-col">
                  {(currentSubscription?.singleShotCredits ?? 0) > 0 && (
                    <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                      {currentSubscription?.singleShotCredits} Credits
                    </div>
                  )}

                  {/* ROW 1 — Name */}
                  <h3 className="text-xl font-bold mb-2">{singleShot.name}</h3>

                  {/* ROW 2 — Description */}
                  <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                    One-time purchase. One short-form video, no expiration.
                  </p>

                  {/* ROW 3 — Price (frontend) */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      &euro;{singleShot.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground text-sm"> /one-time</span>
                  </div>

                  {/* ROW 4 — CTA button */}
                  <Button
                    className="w-full mb-6 bg-white text-black hover:bg-gray-100"
                    onClick={handlePurchaseSingleShot}
                    disabled={createSingleShotCheckout.isPending}
                  >
                    {createSingleShotCheckout.isPending
                      ? "Redirecting to checkout..."
                      : "Purchase"}
                  </Button>

                  {/* ROW 5 — Features */}
                  <ul className="space-y-3 flex-1">
                    {getSingleShotFeatures().map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
  );
}