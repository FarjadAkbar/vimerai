"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Film,
  Play,
  Check,
  Star,
  Users,
  Clock,
  Wand2,
  Palette,
  Globe,
  TrendingUp,
  Instagram,
  Youtube,
  Twitter,
  FileVideo,
  Layers,
  Rocket,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/darkmode";
import { WordRotate } from "@/components/ui/word-rotate";
import { Marquee } from "@/components/ui/marquee";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<"fast" | "cinematic" | "avatar">("fast");
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [demoScript, setDemoScript] = useState("Hey, Alex here! Ready to create your own AI video? Let me help you get started—it's quick, easy, and you can customize it just the way you need. Let's bring your ideas to life!");
  const [activeTab, setActiveTab] = useState("create");

  const generationModes = [
    {
      id: "fast",
      name: "Fast Mode",
      description: "Perfect for social media content. Generate videos in minutes for Instagram, TikTok, and YouTube Shorts.",
      icon: Zap,
      features: ["2-5 minute generation", "Optimized for social media", "720p-1080p resolution", "Perfect for daily content"],
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      id: "cinematic",
      name: "Cinematic Mode",
      description: "Premium quality videos with cinematic effects. Ideal for professional content and marketing campaigns.",
      icon: Film,
      features: ["4K-8K resolution", "Cinematic effects", "Professional quality", "Extended duration"],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "avatar",
      name: "Avatar Mode",
      description: "Coming soon. Create videos with AI avatars for presentations, training, and personalized content.",
      icon: Users,
      features: ["AI-powered avatars", "Personalized content", "Multi-language support", "Coming soon"],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      comingSoon: true,
    },
  ];

  const videoTemplates = [
    {
      id: 1,
      name: "Social Media Ad",
      category: "Marketing",
      description: "Eye-catching ads for Instagram and Facebook",
      thumbnail: "🎬",
      duration: "15-30s",
    },
    {
      id: 2,
      name: "Product Showcase",
      category: "E-commerce",
      description: "Highlight your products with stunning visuals",
      thumbnail: "📦",
      duration: "30-60s",
    },
    {
      id: 3,
      name: "Tutorial Video",
      category: "Education",
      description: "Step-by-step instructional content",
      thumbnail: "📚",
      duration: "1-3min",
    },
    {
      id: 4,
      name: "Brand Story",
      category: "Marketing",
      description: "Tell your brand story with cinematic visuals",
      thumbnail: "✨",
      duration: "60-90s",
    },
    {
      id: 5,
      name: "Event Promo",
      category: "Events",
      description: "Promote events with dynamic video content",
      thumbnail: "🎉",
      duration: "30-45s",
    },
    {
      id: 6,
      name: "Testimonial Video",
      category: "Marketing",
      description: "Showcase customer testimonials",
      thumbnail: "💬",
      duration: "45-60s",
    },
  ];

  const useCases = [
    {
      title: "Social Media Creators",
      description: "Create daily content for Instagram, TikTok, and YouTube Shorts in minutes, not hours.",
      icon: Instagram,
      features: ["Fast generation", "Trending templates", "Multiple formats", "Quick edits"],
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Marketing Teams",
      description: "Produce branded video content at scale for campaigns, ads, and social media.",
      icon: TrendingUp,
      features: ["Brand consistency", "Bulk generation", "Team collaboration", "Analytics"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Content Agencies",
      description: "Deliver high-quality video content to clients faster and more efficiently.",
      icon: Rocket,
      features: ["Client templates", "White-label options", "Priority support", "Custom branding"],
      color: "from-purple-500 to-pink-500",
    },
  ];

  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Generation",
      description: "Transform text prompts into stunning videos using advanced AI. No video editing skills required.",
      detail: "Simply describe your vision and watch it come to life in minutes.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate videos in 2-5 minutes. Perfect for time-sensitive social media content.",
      detail: "Fast Mode is optimized for speed without compromising quality.",
    },
    {
      icon: Palette,
      title: "Smart Preview",
      description: "Preview your video before full generation. One-time preview to test your concept.",
      detail: "See an animated preview instantly, then generate the full video after subscription.",
    },
    {
      icon: Layers,
      title: "Video Templates",
      description: "Choose from professionally designed templates for every use case.",
      detail: "Social media ads, product showcases, tutorials, and more.",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Generate videos in multiple languages with accurate translations.",
      detail: "Reach global audiences with localized content.",
    },
    {
      icon: FileVideo,
      title: "Prompt Studio",
      description: "Save and reuse your best prompts. Build a library of successful video concepts.",
      detail: "Create templates for consistent brand content.",
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
        "Fast Mode only",
        "720p resolution",
        "Standard templates",
        "Smart Preview (1-time)",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Creator",
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
      cta: "Start Free Trial",
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
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Social Media Manager",
      company: "Tech Startup",
      content: "Vimerai has transformed how we create content. What used to take hours now takes minutes. Our engagement rates have doubled!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Content Creator",
      company: "Independent",
      content: "The Fast Mode is perfect for my daily TikTok content. I can create multiple videos in the time it used to take for one.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "E-commerce Brand",
      content: "We've scaled our video production 10x without hiring additional staff. The templates and Prompt Studio are game-changers.",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "Video Producer",
      company: "Creative Agency",
      content: "The quality is incredible. Our clients can't tell the difference between AI-generated and traditionally produced videos.",
      rating: 5,
    },
    {
      name: "Lisa Wang",
      role: "Content Strategist",
      company: "SaaS Company",
      content: "Prompt Studio has become essential to our workflow. We've built a library of templates that save us hours every week.",
      rating: 5,
    },
    {
      name: "James Taylor",
      role: "YouTuber",
      company: "Independent Creator",
      content: "I generate 5-10 videos daily now. The speed and quality are unmatched. This is the future of content creation.",
      rating: 5,
    },
  ];


  const faqs = [
    {
      question: "How long does it take to generate a video?",
      answer:
        "Fast Mode videos are typically generated within 2-5 minutes. Cinematic Mode videos may take 5-15 minutes depending on length and complexity. You'll receive an email notification when your video is ready.",
    },
    {
      question: "What is Smart Preview?",
      answer:
        "Smart Preview lets you see an animated preview of your video before generating the full version. Each account gets one free preview to test the platform. After subscription, you get unlimited previews.",
    },
    {
      question: "Can I edit videos after generation?",
      answer:
        "Yes! You can download your videos and edit them in any video editor. We also provide basic editing tools in the platform for quick adjustments, captions, and formatting.",
    },
    {
      question: "What video formats are supported?",
      answer:
        "We support MP4, WebM, and MOV formats. Export resolution depends on your plan: Starter (720p), Creator (up to 4K), and Pro (up to 8K).",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! All plans come with a 7-day free trial. No credit card required. You can try Smart Preview once for free, and full video generation is available during your trial period.",
    },
    {
      question: "What's the difference between Fast and Cinematic Mode?",
      answer:
        "Fast Mode is optimized for speed (2-5 min generation) and perfect for social media content. Cinematic Mode produces higher quality videos (4K-8K) with enhanced effects, ideal for professional marketing and longer-form content.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Vimerai
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#templates"
              className="text-sm hover:text-primary transition-colors"
            >
              Templates
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
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <p className="text-sm text-primary font-medium">
              🚀 AI Video Generation for Social Media Creators
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
              <WordRotate
                words={["Stunning Videos", "Professional Videos", "Engaging Videos", "Viral Videos", "Amazing Videos"]}
                className="inline"
                motionProps={{
                  initial: { opacity: 0, y: -20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 20 },
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              />
            
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              in Minutes, Not Hours
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your text prompts into professional videos for Instagram, TikTok, and YouTube. 
            No video editing skills required. Just describe your vision and let AI bring it to life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard/generator">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2 text-lg px-8 py-6"
              >
                Start Creating Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6 border-2"
              >
                <Play className="w-5 h-5" /> Watch Demo
              </Button>
            </Link>
          </div>

          {/* Video Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="aspect-video relative overflow-hidden bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0"
                  title="Watch your AI-generated video come to life"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium">LIVE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-black/40 rounded text-xs text-white">HD</div>
                      <div className="px-2 py-1 bg-black/40 rounded text-xs text-white">1080p</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium border border-border z-10">
                ⚡ Generated in 3:24
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-12 text-center border-t border-border pt-12">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                <NumberTicker value={50000} />+
              </p>
              <p className="text-sm text-muted-foreground mt-2">Videos Generated</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                2-5 min
              </p>
              <p className="text-sm text-muted-foreground mt-2">Average Generation Time</p>
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

      {/* Video Showcase Section - Like Synthesia */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See Vimerai in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore videos created by our community. Every video started as a simple text prompt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              id: 1,
              title: "AI Video Generation Demo",
              category: "Tutorial",
              videoId: "dQw4w9WgXcQ", // Replace with actual video ID
            },
            {
              id: 2,
              title: "Social Media Content",
              category: "Marketing",
              videoId: "jNQXAC9IVRw", // Replace with actual video ID
            },
            {
              id: 3,
              title: "Product Showcase",
              category: "E-commerce",
              videoId: "9bZkp7q19f0", // Replace with actual video ID
            },
            {
              id: 4,
              title: "Brand Story Video",
              category: "Marketing",
              videoId: "kJQP7kiw5Fk", // Replace with actual video ID
            },
            {
              id: 5,
              title: "Event Promotion",
              category: "Events",
              videoId: "L_jWHffIx5E", // Replace with actual video ID
            },
            {
              id: 6,
              title: "Testimonial Video",
              category: "Marketing",
              videoId: "fJ9rUzIMcZQ", // Replace with actual video ID
            },
          ].map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-video rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&showinfo=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-white mb-1">{video.title}</p>
                <p className="text-xs text-white/70">{video.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>


      {/* Generation Modes Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Generation Mode
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three powerful modes to match your needs. Fast Mode is perfect for daily social media content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {generationModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => !mode.comingSoon && setActiveMode(mode.id as "fast" | "cinematic" | "avatar")}
                className={`text-left p-6 rounded-xl border-2 transition-all ${
                  isActive
                    ? `${mode.borderColor} ${mode.bgColor} border-2`
                    : "border-border hover:border-primary/50"
                } ${mode.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${mode.bgColor}`}>
                    <Icon className={`w-6 h-6 ${mode.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{mode.name}</h3>
                    {mode.comingSoon && (
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{mode.description}</p>
                <ul className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        </div>
      </section>

      {/* Free Demo Tool Section - Like Synthesia */}
      {/* <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <p className="text-sm text-primary font-medium">FREE DEMO</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Try out our free AI Video Tool
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of AI video generation. No signup or credit card required.
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 1: Select an AI avatar</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 0, name: "Alex", emoji: "👩", color: "from-blue-500 to-cyan-500" },
                  { id: 1, name: "Sarah", emoji: "👩🏿", color: "from-purple-500 to-pink-500" },
                  { id: 2, name: "Mike", emoji: "👨", color: "from-green-500 to-emerald-500" },
                ].map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                      selectedAvatar === avatar.id
                        ? "border-primary ring-2 ring-primary/50 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${avatar.color} opacity-30`} />
                    <div className="relative h-full flex items-center justify-center text-5xl">
                      {avatar.emoji}
                    </div>
                    {selectedAvatar === avatar.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: Type in your script in any language</h3>
              <Textarea
                value={demoScript}
                onChange={(e) => setDemoScript(e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Enter your video script here..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                {300 - demoScript.length} characters left
              </p>
            </div>

            <Link href="/dashboard/generator">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 gap-2">
                Create free AI video <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground text-center">
              Political, inappropriate and discriminatory content will not be approved.
            </p>
          </div>

          <div className="relative">
            <div className="sticky top-24">
              <div className="relative rounded-2xl border-2 border-border bg-card overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-8xl">
                      {selectedAvatar === 0 ? "👩" : selectedAvatar === 1 ? "👩🏿" : "👨"}
                    </div>
                    <div className="px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg">
                      <p className="text-sm font-medium">AVATAR: {selectedAvatar === 0 ? "ALEX" : selectedAvatar === 1 ? "SARAH" : "MIKE"}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white/80 font-medium">Preview will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section> */}
      
      {/* Use Cases Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for Content Creators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re a solo creator or part of a marketing team, Vimerai scales with you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-xl border border-border hover:border-primary/50 transition-all group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>


      {/* Video Templates Section */}
      <section id="templates" className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <p className="text-sm text-primary font-medium">COMING SOON</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Video Templates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with professionally designed templates. Customize them to match your brand. This feature is coming soon!
            </p>
          </div>

        <div className="grid md:grid-cols-3 gap-6">
          {videoTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all cursor-not-allowed opacity-75"
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
                  Coming Soon
                </div>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-6xl">
                {template.thumbnail}
              </div>
              <div className="p-6 pb-14">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {template.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.duration}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                <div
                  className={`transition-all duration-300 ${
                    hoveredTemplate === template.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <Button size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" disabled>
            Browse All Templates (Coming Soon)
          </Button>
        </div>
        </div>
      </section>


      {/* Features Section */}
      <section
        id="features"
        className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features to create professional videos effortlessly
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:bg-card/50"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-2">{feature.description}</p>
                <p className="text-sm text-muted-foreground/80">{feature.detail}</p>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* Testimonials Section with Marquee */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by Creators
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users are saying
          </p>
        </div>

        <Marquee pauseOnHover className="[--duration:40s]">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="mx-4 w-[350px] shrink-0 p-6 rounded-xl border border-border bg-card/50"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic text-sm">&quot;{testimonial.content}&quot;</p>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </Marquee>
        </div>
      </section>

      {/* Pricing Section with Border Beam */}
      <section
        id="pricing"
        className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
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
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section
        id="faq"
        className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Vimerai
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border border-border bg-card/50 px-6 hover:border-primary/50 transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section - Simple and Centered */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-24 md:py-32 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            {/* Fallback to local video if available */}
            <source src="/assets/videos/Login.mp4" type="video/mp4" />
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-3xl mx-auto text-center space-y-8 z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            Ready to try Vimerai?
          </h2>
          <p className="text-lg md:text-xl text-white/95 max-w-xl mx-auto drop-shadow-md">
            Join thousands of creators and start making AI videos in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/dashboard/generator">
              <Button
                size="lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
              >
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterWithAnimation />
    </div>
  );
}

function FooterWithAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <footer ref={ref} className="border-t border-border bg-card py-12">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="grid md:grid-cols-4 gap-8 mb-12" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Vimerai</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI video generation platform for social media creators and marketers.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#templates" className="hover:text-foreground transition">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/generator" className="hover:text-foreground transition">
                  Generator
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
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
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>
        <motion.div
          className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4"
          variants={itemVariants}
        >
          <p>&copy; 2026 Vimerai. All rights reserved.</p>
          <div className="flex gap-6">
            <motion.a
              href="#"
              className="hover:text-foreground transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Twitter
            </motion.a>
            <motion.a
              href="#"
              className="hover:text-foreground transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LinkedIn
            </motion.a>
            <motion.a
              href="#"
              className="hover:text-foreground transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GitHub
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
