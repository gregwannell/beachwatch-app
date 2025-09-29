"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, BarChart3, Filter, Waves, TrendingUp, MapPin } from 'lucide-react'

const features = [
  {
    icon: Map,
    title: "Interactive UK Map",
    description: "Explore beach litter data across the UK with our interactive map. Drill down from countries to counties and regions to see detailed local data.",
    color: "text-blue-600"
  },
  {
    icon: BarChart3,
    title: "Data Visualization",
    description: "View comprehensive charts and statistics showing litter trends, category breakdowns, and comparative analysis across different regions.",
    color: "text-green-600"
  },
  {
    icon: Filter,
    title: "Advanced Filtering",
    description: "Filter data by year range, region, litter categories, and more to focus on the information that matters most to your research.",
    color: "text-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Discover patterns and trends in beach litter data over time. Identify improving or deteriorating areas and track conservation efforts.",
    color: "text-orange-600"
  },
  {
    icon: MapPin,
    title: "Regional Insights",
    description: "Get detailed statistics for specific regions, including litter density, most common items, and environmental impact assessments.",
    color: "text-red-600"
  },
  {
    icon: Waves,
    title: "Marine Conservation",
    description: "Support marine conservation efforts with data-driven insights. Understand the impact of human activity on our coastal environments.",
    color: "text-teal-600"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Tools for Environmental Research
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides everything you need to explore,
            analyze, and understand beach litter data across the UK.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-background border ${feature.color}`}>
                      <IconComponent className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Waves className="h-4 w-4" />
            <span>Powered by Marine Conservation Society data</span>
          </div>
        </div>
      </div>
    </section>
  )
}