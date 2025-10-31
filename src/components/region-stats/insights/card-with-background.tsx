import Image from 'next/image'
import { ReactNode } from 'react'

interface CardWithBackgroundProps {
  children: ReactNode
  backgroundImage?: string
  backgroundOpacity?: number
}

export function CardWithBackground({
  children,
  backgroundImage,
  backgroundOpacity = 0.05
}: CardWithBackgroundProps) {
  return (
    <div className="relative p-5 rounded-xl border bg-card min-h-[200px] flex flex-col overflow-hidden">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          style={{ opacity: backgroundOpacity }}
        />
      )}
      <div className="relative flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}
