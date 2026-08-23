"use client";

import { LandingHero } from "@/components/marketing/landing-hero";
import {
  AccountsSection,
  AgentsSection,
  ComparisonSection,
  ControlSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
  ResultsSection,
  StepsSection,
  TestimonialsSection,
} from "@/components/marketing/landing-sections";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <LandingHero />
      <TestimonialsSection />
      <AccountsSection />
      <ControlSection />
      <StepsSection />
      <ResultsSection />
      <ComparisonSection />
      <AgentsSection />
      <FaqSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
