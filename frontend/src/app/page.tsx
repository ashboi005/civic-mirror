"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/HeroSection"
import { StatsSection } from "@/components/sections/StatsSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { ProcessStepsSection } from "@/components/sections/ProcessStepsSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import { AppShowcaseSection } from "@/components/sections/AppShowcaseSection"
import { TrustedPartnersSection } from "@/components/sections/TrustedPartnersSection"
import { FAQSection } from "@/components/sections/FAQSection"
import { CTASection } from "@/components/sections/CTASection"
import { Footer } from "@/components/sections/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ProcessStepsSection />
      <TestimonialsSection />
      <AppShowcaseSection />
      <TrustedPartnersSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
