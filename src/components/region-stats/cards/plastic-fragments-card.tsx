"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { ExternalLink, Info } from "lucide-react"
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart"

interface PlasticFragmentsCardProps {
  avgPer100m: number
  presence: number
  className?: string
}

const TEAL_COLOR = ["var(--mcs-teal)"] as const

export function PlasticFragmentsCard({ avgPer100m, presence, className }: PlasticFragmentsCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const chartData = React.useMemo(() => ([{
    name: "Plastic fragments: 0-2.5cm",
    category: "Plastic fragments: 0-2.5cm",
    value: avgPer100m,
    percentage: presence,
  }]), [avgPer100m, presence])

  const explanationContent = (
    <div className="text-sm text-muted-foreground space-y-3">
      <p className="font-semibold">Why highlight plastic fragments?</p>
      <p className="text-sm">
        Plastic fragments between 0 and 2.5cm are one of the most commonly recorded items on UK beaches and a significant source of microplastic pollution. They break down further over time, making them harder to remove and more likely to enter the food chain.
      </p>
      <p className="text-sm">
        The average shown here is the number of plastic fragments (0–2.5cm) found per 100 metres of beach surveyed in this region. The presence percentage indicates how frequently they appear across surveys — a high presence means they are found consistently, not just occasionally.
      </p>
      <p className="text-sm">
        You can help track microplastic pollution through the MCS Big Microplastic Survey.
      </p>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-m font-bold text-muted-foreground">
              Plastic Fragments (0–2.5cm)
            </CardTitle>
            <CardDescription className="text-xs">
              Avg per 100m · Found on {presence.toFixed(0)}% of surveys
            </CardDescription>
          </div>

          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto w-auto p-1 hover:bg-primary/10" aria-label="View plastic fragments information">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Plastic Fragments (0–2.5cm)</DrawerTitle>
                  <DrawerDescription>Why we highlight this item</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6">{explanationContent}</div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto w-auto p-1 hover:bg-primary/10" aria-label="View plastic fragments information">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plastic Fragments (0–2.5cm)</DialogTitle>
                  <DialogDescription>Why we highlight this item</DialogDescription>
                </DialogHeader>
                {explanationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
        <HorizontalBarChart
          data={chartData}
          height={40}
          maxItems={1}
          colors={TEAL_COLOR}
          barThickness={20}
          showBarLabel={false}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="cta" size="sm" className="h-auto py-1.5 text-xs w-fit" asChild>
          <a href="https://www.mcsuk.org/what-you-can-do/citizen-science/big-microplastic-survey/" target="_blank" rel="noopener noreferrer">
            Help collect data
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
