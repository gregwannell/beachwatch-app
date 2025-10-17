"use client"

import { Button } from '@/components/ui/button'
import { ArrowRight, Waves, Map, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-16 md:pt-20">
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
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent" />
      </div>

      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-blue-950/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Small MCS Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/mcs-logo.png"
              alt="Marine Conservation Society"
              width={200}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-mcs-navy dark:text-white hover:text-mcs-orange dark:hover:text-mcs-orange transition-colors">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium text-mcs-navy dark:text-white hover:text-mcs-orange dark:hover:text-mcs-orange transition-colors">
              How to Use
            </Link>
            <Link href="#" className="text-sm font-medium text-mcs-navy dark:text-white hover:text-mcs-orange dark:hover:text-mcs-orange transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right: Small Explore Button */}
          <Button asChild size="sm" className="bg-mcs-orange hover:bg-mcs-orange/90 text-white rounded-full">
            <Link href="/explore">
              Explore the Data
            </Link>
          </Button>
        </div>
      </header>

      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        {/* Logo and branding */}
        <div className="flex justify-center mb-8">
          <Image
            src="/mcs-logo.png"
            alt="Marine Conservation Society"
            width={400}
            height={96}
            className="h-24 w-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-mcs-navy dark:text-white mb-6 drop-shadow-md">
          <span className="block">Explore UK</span>
          <span className="block">Beach Litter Data</span>
        </h1>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button asChild size="lg" className="text-lg px-8 py-3 h-auto bg-mcs-orange hover:bg-mcs-orange/90 text-white shadow-lg rounded-full">
            <Link href="/explore" className="flex items-center gap-2">
              Explore the Data
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 h-auto border-2 border-white hover:text-mcs-navy text-mcs-navy hover:bg-white/80 bg-white/20 backdrop-blur-sm shadow-lg rounded-full">
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>

        {/* Powered by text */}
        <p className="text-sm text-mcs-navy/80 dark:text-white/80">
          Powered by Marine Conservation Society volunteer survey data
        </p>
      </div>
    </section>
  )
}