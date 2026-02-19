"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  usePlans,
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
import type { NotificationState } from "@/types/components.types";
import { Spinner } from "@/components/ui/spinner";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: userData } = useUser();
  const { data: currentSubscription } = useCurrentSubscription();
  const { data: plansData, isLoading: loading } = usePlans();
  const createCheckout = useCreateCheckout();
  const createSingleShotCheckout = useCreateSingleShotCheckout();
  const captureSingleShot = useCaptureSingleShot();
  const activateSubscription = useActivateSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );
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
          message:
            "We could not complete your purchase. Please contact support if you were charged.",
        });
      },
    });
  }, [searchParams, captureSingleShot, router]);

  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");
    const subSuccess = searchParams.get("subscription") === "success";
    if (!subscriptionId || !subSuccess || subscriptionActivateAttempted.current)
      return;

    subscriptionActivateAttempted.current = true;
    activateSubscription.mutate(subscriptionId, {
      onSuccess: (data) => {
        if (data?.plan) {
          window.history.replaceState({}, "", "/pricing");
          const planName =
            data.plan === "creator"
              ? "AI Creator"
              : data.plan.charAt(0).toUpperCase() + data.plan.slice(1);
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
          message:
            "We could not activate your subscription. Please contact support if you were charged.",
        });
      },
    });
  }, [searchParams, activateSubscription, router]);

  const plans: Plan[] = plansData?.plans ?? [];
  const singleShot = plansData?.singleShot ?? null;

  const getFeatures = () => [
    "Fast Mode generation",
    "Smart Preview",
    "Prompt Studio access",
  ];

  const getSingleShotFeatures = () => [
    "1 video generation",
    "Never expires",
    "Consumed only when you generate",
    "Fast Mode generation",
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
      const currentPlanName =
        currentSubscription.plan === "creator"
          ? "AI Creator"
          : currentSubscription.plan.charAt(0).toUpperCase() +
            currentSubscription.plan.slice(1);
      const newPlanName =
        planId === "creator"
          ? "AI Creator"
          : planId.charAt(0).toUpperCase() + planId.slice(1);
      const totalVideos =
        currentSubscription.videosRemaining + selectedPlan.videosPerMonth;

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
      { plan, billingPeriod, successUrl, cancelUrl },
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
    if (planId === "starter") return "Perfect for getting started";
    if (planId === "creator") return "For content creators and marketers";
    return "For professional creators";
  };

  // ── Shared card inner layout ──────────────────────────────────────────────
  // Each card is a flex-col. Inside we have 5 "rows":
  //   1. Name
  //   2. Description      ← fixed height via min-h
  //   3. Price
  //   4. Button
  //   5. Feature list     ← flex-1 (takes remaining space)
  // All rows use the same class names so they align across the CSS grid.

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentSubscription && currentSubscription.plan !== "free"
                ? "Stack plans to add more videos to your account"
                : "Choose the plan that fits your needs"}
            </p>
            {(currentSubscription?.plan !== "free" ||
              (currentSubscription?.singleShotCredits ?? 0) > 0) && (
              <div className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg">
                <span className="font-medium">Current Plan: </span>
                <span className="capitalize">
                  {currentSubscription?.plan === "creator"
                    ? "AI Creator"
                    : (currentSubscription?.plan ?? "")}
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
                    {(currentSubscription?.singleShotCredits ?? 0) !== 1
                      ? "s"
                      : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Billing toggle */}
          {plans.length > 0 && (
            <div className="flex justify-center gap-2 mb-10">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingPeriod("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingPeriod("yearly")}
              >
                Yearly (15% off)
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner className="size-8" />
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto items-stretch">
              {/* ── Subscription plan cards ── */}
              {plans.map((plan) => {
                const isCurrentPlan =
                  currentSubscription && currentSubscription.plan === plan.id;
                const price =
                  billingPeriod === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-6 flex flex-col ${
                      isCurrentPlan
                        ? "border-[#00c951] border-4 bg-[#005823]/30"
                        : "border-border bg-card"
                    }`}
                  >
                    {/* Badges */}
                    {plan.popular && (
                      <>
                        <BorderBeam
                          size={100}
                          duration={6}
                          colorFrom="#ffaa40"
                          className="opacity-60"
                          colorTo="#9c40ff"
                          borderWidth={2}
                        />
                        {/* <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full z-10">
                          Most Popular
                        </div> */}
                      </>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                        Active
                      </div>
                    )}

                    {/* ROW 1 — Plan name */}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                    {/* ROW 2 — Description (fixed min-height keeps rows aligned) */}
                    <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                      {getPlanDescription(plan.id)}
                    </p>

                    {/* ROW 3 — Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        &euro;{Math.floor(price)}
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
                        ? "Redirecting to PayPal..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : "Subscribe"}
                    </Button>

                    {/* ROW 5 — Features (flex-1 fills remaining space) */}
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.videosPerMonth} video generations/month
                        </span>
                      </li>
                      {getFeatures().map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* ── Single Shot card — 4th column, same grid ── */}
              {singleShot && (
                <div className="relative rounded-xl border-2 border-blue-400 bg-card p-6 flex flex-col">
                  {/* Badges */}
                  {/* <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full z-10">
                    One-Time
                  </div> */}
                  {(currentSubscription?.singleShotCredits ?? 0) > 0 && (
                    <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full z-10">
                      {currentSubscription?.singleShotCredits} Credits
                    </div>
                  )}

                  {/* ROW 1 — Name */}
                  <h3 className="text-xl font-bold mb-2">{singleShot.name}</h3>

                  {/* ROW 2 — Description (same min-h as subscription cards) */}
                  <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                    One-time purchase. No expiration. Use whenever you want.
                  </p>

                  {/* ROW 3 — Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      &euro;{singleShot.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      one-time
                    </span>
                  </div>

                  {/* ROW 4 — CTA button */}
                  <Button
                    className="w-full mb-6 bg-white text-black hover:bg-gray-100"
                    onClick={handlePurchaseSingleShot}
                    disabled={createSingleShotCheckout.isPending}
                  >
                    {createSingleShotCheckout.isPending
                      ? "Redirecting to PayPal..."
                      : "Subscribe"}
                  </Button>

                  {/* ROW 5 — Features (same count as subscription cards) */}
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
