"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, ArrowRight } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { subscriptionApi } from "@/lib/api/subscription.api"

interface PricingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [plans, setPlans] = useState<Array<{
    id: string
    name: string
    price: number
    videosPerMonth: number
    popular?: boolean
  }>>([])

  useEffect(() => {
    if (open) {
      subscriptionApi.getPlans().then((response) => {
        setPlans(response.plans)
      })
    }
  }, [open])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Simple, Transparent Pricing
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            Choose the plan that fits your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
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
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => onOpenChange(false)}
              >
                Start Generating <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
