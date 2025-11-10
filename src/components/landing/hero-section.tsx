"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0 md:pt-20">
      {/* Beach scene illustration as background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Littered Beach Full Scene.png"
          alt="Beach scene illustration"
          width={3000}
          height={600}
          className="w-full h-full object-cover object-center"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        {/* Logo and branding */}
        <div className="flex justify-center mb-8">
          <Image
            src="/bubbles-dark.gif"
            alt="Marine Conservation Society"
            width={400}
            height={96}
            className="h-25 w-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-mcs-navy mb-6 drop-shadow-md">
          <span className="block">Beachwatch</span>
          <span className="block">Data Explorer</span>
        </h1>

        {/* CTA Button */}
        <div className="flex flex-row gap-4 justify-center items-center mb-6">
          <Button asChild size="lg" className="text-lg px-8 py-3 h-auto w-44 bg-mcs-orange hover:bg-mcs-orange/90 text-white shadow-lg rounded-full">
            <Link href="/explore" className="flex items-center gap-2">
              Explore
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 h-auto w-44 border-1 border-white dark:border-white hover:text-mcs-navy text-mcs-navy dark:text-mcs-navy hover:bg-white/80 bg-white dark:bg-white dark:hover:bg-white/80 backdrop-blur-sm shadow-lg rounded-full">
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>

        {/* Powered by text */}
        <p className="text-sm text-mcs-navy/80">
          Powered by Marine Conservation Society data
        </p>
      </div>
    </section>
  )
}