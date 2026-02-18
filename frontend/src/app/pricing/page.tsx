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

  // Handle return from PayPal Single Shot: capture order and show success
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

  // Handle return from PayPal Subscription: activate subscription
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

  const getFeatures = () => {
    return ["Fast Mode generation", "Smart Preview", "Prompt Studio access"];
  };

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
      {
        onSettled: () => setActivatingPlanId(null),
      },
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

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

          {/* Billing toggle: Monthly (default) / Yearly */}
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
            <div className="flex items-center justify-center ">
              <Spinner className="size-8" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                    className={`relative rounded-xl border-2 p-8 w-full ${
                      plan.popular
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border bg-card"
                    }`}
                  >
                    {plan.popular && (
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
                          : "For professional creators"}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">&euro;{price}</span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.videosPerMonth} video generations/month
                        </span>
                      </li>
                      {getFeatures().map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={activatingPlanId !== null || isCurrentPlan}
                    >
                      {activatingPlanId === plan.id
                        ? "Redirecting to PayPal..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : currentSubscription &&
                              currentSubscription.plan !== "free"
                            ? "Subscribe"
                            : "Subscribe with PayPal"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Shot card */}
          {singleShot && (
            <div className="mt-12 max-w-md mx-auto">
              <div className="rounded-xl border-2 border-border bg-card p-8">
                <h3 className="text-2xl font-bold mb-2">{singleShot.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  One-time purchase. One video credit. No expiration. Use it
                  whenever you want.
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    &euro;{singleShot.price}
                  </span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {singleShot.videosIncluded} video generation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Never expires</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Consumed only when you generate
                    </span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handlePurchaseSingleShot}
                  disabled={createSingleShotCheckout.isPending}
                >
                  {createSingleShotCheckout.isPending
                    ? "Redirecting to PayPal..."
                    : "Buy with PayPal"}
                </Button>
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
