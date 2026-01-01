"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, BarChart3, Play } from "lucide-react";
import { ModeToggle } from "@/components/ui/darkmode";

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: "ai-powered",
      icon: Sparkles,
      title: "AI-Powered Generation",
      description:
        "Turn text prompts into stunning videos using advanced AI models.",
    },
    {
      id: "fast-rendering",
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Generate videos in minutes, not hours. Get results instantly.",
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Monitor your video performance with detailed analytics.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for trying out Vimerai",
      features: [
        "5 video generations/month",
        "720p resolution",
        "Standard templates",
        "Email support",
      ],
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For content creators",
      features: [
        "50 video generations/month",
        "4K resolution",
        "Premium templates",
        "Priority support",
        "Advanced analytics",
      ],
      cta: "Start Free Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For teams and agencies",
      features: [
        "Unlimited generations",
        "8K resolution",
        "Custom templates",
        "Dedicated support",
        "API access",
      ],
      cta: "Contact Sales",
    },
  ];

  const faqs = [
    {
      question: "How long does it take to generate a video?",
      answer:
        "Most videos are generated within 2-5 minutes depending on length and complexity. Longer or more complex videos may take up to 15 minutes.",
    },
    {
      question: "Can I edit videos after generation?",
      answer:
        "Yes! You can edit videos in our built-in editor, adjust timing, add captions, and customize elements to perfectly match your needs.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support MP4, WebM, and MOV formats. You can export in any resolution from 720p up to 8K depending on your plan.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, all plans come with a 7-day free trial. No credit card required to get started.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Vimerai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm hover:text-primary transition-colors"
            >
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">  
            <p className="text-sm text-primary font-medium">
              AI Video Generation Simplified
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
            Create Videos with AI in Minutes
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into stunning videos. No experience needed. No
            expensive software. Just describe what you want and let AI bring it
            to life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                Start Creating <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <button className="px-6 py-3 rounded-lg border border-primary/30 hover:border-primary/60 text-foreground hover:bg-primary/5 transition-all flex items-center gap-2">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-12 text-center border-t border-border pt-12">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                50K+
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Videos Generated
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                1000+
              </p>
              <p className="text-sm text-muted-foreground mt-2">Active Users</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                99.9%
              </p>
              <p className="text-sm text-muted-foreground mt-2">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create professional videos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:bg-card cursor-pointer"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                plan.featured
                  ? "border-primary bg-primary/5 ring-2 ring-primary scale-105"
                  : "border-border hover:border-primary/50"
              } p-8`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Have a question? We have answers.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-border hover:border-primary/50 transition-all"
            >
              <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Create?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of creators using Vimerai to bring their visions to
          life.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
            Start Your Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">Vimerai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create stunning videos with AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 Vimerai. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
