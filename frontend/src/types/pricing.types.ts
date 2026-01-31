// Pricing page types

export interface Plan {
  id: string;
  name: string;
  price: number;
  videosPerMonth: number;
  popular?: boolean;
}

export type SubscriptionPlan = "starter" | "creator" | "pro" ;

export interface PlanMap {
  [key: string]: SubscriptionPlan;
}
