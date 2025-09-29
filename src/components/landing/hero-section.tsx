"use client"

import { Button } from '@/components/ui/button'
import { ArrowRight, Waves, Map, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-background dark:to-blue-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent dark:via-background/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo and branding */}
        <div className="flex justify-center mb-8">
          <Image
            src="/mcs-logo.png"
            alt="Marine Conservation Society"
            width={400}
            height={96}
            className="h-24 w-auto"
            priority
          />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
          <span className="block">Explore UK</span>
          <span className="block text-primary">Beach Litter Data</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          Discover comprehensive beach litter survey data from across the UK.
          Visualize trends, explore regional patterns, and understand the impact
          of marine pollution on our coastlines.
        </p>

        {/* Key stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-background/50 rounded-full border">
            <Map className="h-4 w-4 text-primary" />
            <span>Regional Coverage</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-background/50 rounded-full border">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Interactive Analytics</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-background/50 rounded-full border">
            <Waves className="h-4 w-4 text-primary" />
            <span>Environmental Impact</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
            <Link href="/explore" className="flex items-center gap-2">
              Explore the Data
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}