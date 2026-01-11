"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { subscriptionApi } from "@/lib/api/subscription.api"
import Header from "@/components/header"

export default function PricingPage() {
  const [plans, setPlans] = useState<Array<{
    id: string
    name: string
    price: number
    videosPerMonth: number
    popular?: boolean
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    subscriptionApi.getPlans().then((response) => {
      setPlans(response.plans)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const getFeatures = (planId: string) => {
    const baseFeatures = [
      "Fast Mode generation",
      "Smart Preview (one-time)",
      "Prompt Studio access",
    ]
    
    if (planId === "pro") {
      return [
        ...baseFeatures,
        "4K resolution",
        "Priority support",
      ]
    }
    
    return baseFeatures
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs.
            </p>
          </div>

          {/* Pricing Plans */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
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
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {plan.id === "starter"
                      ? "Perfect for getting started"
                      : plan.id === "creator"
                      ? "For content creators and marketers"
                      : "For professional creators"}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{plan.videosPerMonth} video generations/month</span>
                    </li>
                    {getFeatures(plan.id).map((feature, fIdx) => (
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
                      Start Generating <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Single Shot Option (Secondary) */}
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto p-8 rounded-xl border border-border bg-card">
              <h3 className="text-2xl font-bold mb-2">Single Shot</h3>
              <p className="text-muted-foreground mb-6">
                Need just one video? Try our single shot option.
              </p>
              <Link href="/signup">
                <Button variant="outline">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
