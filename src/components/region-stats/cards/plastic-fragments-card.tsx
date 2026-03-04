"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

interface PlasticFragmentsCardProps {
  avgPer100m: number
  presence: number
  className?: string
}

const explanationContent = (
  <div className="text-sm text-muted-foreground space-y-3">
    <p className="font-semibold text-foreground">What are they?</p>
    <p>
      These are small fragments of plastic or polystyrene smaller than 2.5cm. They come from larger plastic items that have broken apart due to UV exposure, wave action, and weathering.
    </p>
    <p className="font-semibold text-foreground">Why are they excluded from the main totals?</p>
    <p>
      These are excluded from any regional calculations because their abundance can vary enormously between beaches and surveys (sometimes numbering in the thousands!), which would distort the average litter counts. Showing them separately gives a clearer picture of both general litter levels and microplastic pollution.
    </p>
  </div>
)

export function PlasticFragmentsCard({ avgPer100m, presence, className }: PlasticFragmentsCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const infoTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto w-auto p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
      aria-label="What are plastic pieces and why are they excluded?"
    >
      <Info className="h-4 w-4" />
    </Button>
  )

  return (
    <div className={`bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden ${className ?? ''}`}>
      <Image
        src="/topography-dark.svg"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 1 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-l font-bold text-white leading-tight">Plastic Pieces (0–2.5cm)</p>
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>{infoTrigger}</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Plastic Pieces (0–2.5cm)</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6">{explanationContent}</div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>{infoTrigger}</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plastic Pieces (0–2.5cm)</DialogTitle>
                </DialogHeader>
                {explanationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Middle section */}
      <div className="relative z-10 mt-4">
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-bold text-mcs-teal">{avgPer100m.toFixed(1)}</span>
          <span className="text-sm text-slate-200 mb-1.5">per 100m of beach</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
          <div
            className="bg-mcs-teal h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(presence, 100)}%` }}
          />
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Found on <strong>{presence.toFixed(0)}%</strong> of surveys. These small fragments break down further over time, entering the food chain as microplastics.
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-5">
        <a
          href="https://www.mcsuk.org/what-you-can-do/citizen-science/big-microplastic-survey/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-mcs-teal px-4 py-3 text-sm font-semibold text-white hover:bg-mcs-teal/80 transition-colors"
        >
          Join the Big Microplastic Survey
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>
      </div>
    </div>
  )
}
