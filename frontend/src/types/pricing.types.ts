// Pricing page types

export interface Plan {
  id: string;
  name: string;
  videosPerMonth: number;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
}

export interface SingleShotProduct {
  id: string;
  name: string;
  type: "one-time";
  videosIncluded: number;
  price: number;
}

export type SubscriptionPlan = "starter" | "creator" | "pro";

export type BillingPeriod = "monthly" | "yearly";

export interface PlanMap {
  [key: string]: SubscriptionPlan;
}
