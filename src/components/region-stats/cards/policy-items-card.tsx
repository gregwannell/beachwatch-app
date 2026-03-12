"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { YearOverYearBadge } from "@/components/region-stats/components/year-over-year-badge"

interface PolicyItemData {
  policyItem: string
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface PolicyItemsCardProps {
  data: PolicyItemData[]
  className?: string
}

const explanationContent = (
  <div className="text-sm text-muted-foreground space-y-3">
    <p>These groups are monitored by the Marine Conservation Society as part of UK & international policy work to track the need for, or progress on, reducing specific litter categories.</p>
    <dl className="space-y-2">
      <div>
        <dt className="font-semibold text-foreground">Drink related litter</dt>
        <dd>Items included in plans for proposed drink return schemes, such as plastic bottles, metal cans, and other drink packaging.</dd>
      </div>
      <div>
        <dt className="font-semibold text-foreground">Fishing</dt>
        <dd>Fishing lines, nets, hooks, rope and other fishing gear.</dd>
      </div>
      <div>
        <dt className="font-semibold text-foreground">Sewage related debris</dt>
        <dd>Items flushed down toilets and drains, including wet wipes and cotton buds.</dd>
      </div>
      <div>
        <dt className="font-semibold text-foreground">Single-use Plastics</dt>
        <dd>Items covered by the EU Single Use Plastics Directive, such as straws, cutlery and balloon sticks.</dd>
      </div>
      <div>
        <dt className="font-semibold text-foreground">Smoking litter</dt>
        <dd>Cigarette butts, filters, lighters and tobacco packaging.</dd>
      </div>
    </dl>
  </div>
)

export function PolicyItemsCard({ data, className }: PolicyItemsCardProps) {
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
      className="h-auto w-auto p-1 hover:bg-primary/10"
      aria-label="About policy monitoring categories"
    >
      <Info className="h-4 w-4 text-muted-foreground" />
    </Button>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-m font-bold text-muted-foreground">
              Policy Monitoring
            </CardTitle>
            <CardDescription className="text-xs">Key litter categories tracked against UK and international policy targets</CardDescription>
          </div>
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>{infoTrigger}</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Policy Monitoring Categories</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6">{explanationContent}</div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>{infoTrigger}</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Policy Monitoring Categories</DialogTitle>
                </DialogHeader>
                {explanationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground/50 h-9 px-3">Policy Item</TableHead>
                <TableHead className="text-xs text-muted-foreground/50 h-9 px-3">Total</TableHead>
                <TableHead className="text-xs text-muted-foreground/50 h-9 px-3">Avg / 100m</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(item => (
                <TableRow key={item.policyItem} className="text-xs">
                  <TableCell className="px-3 py-2.5 font-medium">{item.policyItem}</TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums">{item.total.toLocaleString()}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">{item.avgPer100m.toFixed(1)}</span>
                      <YearOverYearBadge change={item.yearOverYearChange} variant="plain" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
