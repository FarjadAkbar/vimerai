"use client"

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

interface PricingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const plan = {
    name: "AI Creator",
    price: "$99",
    period: "/month",
    description: "For content creators and marketers",
    features: [
      "10 video generations/month",
      "4K resolution",
      "Premium templates",
      "Unlimited Smart Previews",
      "Prompt Studio access",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start Generating",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Simple, Transparent Pricing
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mt-8">
          <div className="relative rounded-xl border-2 border-primary bg-primary/5 ring-2 ring-primary p-8 w-full max-w-md">
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
            {/* <Link href="/signup" className="block" onClick={() => onOpenChange(false)}> */}
              <Button className="w-full" variant="default"  onClick={() => onOpenChange(false)}>
                {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            {/* </Link> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
