"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"

export default function PricingPage() {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for trying out Vimerai",
      features: [
        "5 video generations/month",
        "Fast Mode only",
        "720p resolution",
        "Standard templates",
        "Smart Preview (1-time)",
        "Email support",
      ],
      cta: "Start Generating",
      popular: false,
    },
    {
      name: "AI Creator",
      price: "$99",
      period: "/month",
      description: "For content creators and marketers",
      features: [
        "50 video generations/month",
        "Fast + Cinematic Mode",
        "4K resolution",
        "Premium templates",
        "Unlimited Smart Previews",
        "Prompt Studio access",
        "Priority support",
        "Advanced analytics",
      ],
      cta: "Start Generating",
      popular: true,
    },
    {
      name: "Pro",
      price: "$299",
      period: "/month",
      description: "For agencies and power users",
      features: [
        "200 video generations/month",
        "All modes (Fast, Cinematic, Avatar)",
        "8K resolution",
        "Custom templates",
        "API access",
        "White-label options",
        "Dedicated support",
        "Team collaboration",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
 
      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl border-2 transition-all ${
                plan.popular
                  ? "border-primary bg-primary/5 ring-2 ring-primary scale-105"
                  : "border-border hover:border-primary/50"
              } p-8`}
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
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Single Shot Option */}
        {/* <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-xl border border-border bg-card/50 max-w-md">
            <h3 className="text-xl font-bold mb-2">Single Shot</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Need just one video? Pay per generation.
            </p>
            <p className="text-3xl font-bold mb-4">$9.99</p>
            <Link href="/signup">
              <Button variant="outline">
                Get Single Shot <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  )
}

