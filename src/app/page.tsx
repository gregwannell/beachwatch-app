import { MainLayout } from '@/components/layout/main-layout'
import { Card } from '@/components/ui/card'

function FilterSidebar() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground mb-3">
        Data Filters
      </h3>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Date Range</h4>
        <p className="text-xs text-muted-foreground">Filter controls coming soon</p>
      </Card>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Location</h4>
        <p className="text-xs text-muted-foreground">Region selection coming soon</p>
      </Card>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Litter Types</h4>
        <p className="text-xs text-muted-foreground">Category filters coming soon</p>
      </Card>
    </div>
  )
}

function StatsPanel() {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-2">Survey Stats</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Surveys:</span>
            <span className="font-medium">1,247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Beaches Covered:</span>
            <span className="font-medium">423</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items Logged:</span>
            <span className="font-medium">89,234</span>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-2">Top Items</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plastic bottles:</span>
            <span className="font-medium">12,456</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cigarette butts:</span>
            <span className="font-medium">8,923</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Food wrappers:</span>
            <span className="font-medium">7,134</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <MainLayout 
      sidebar={<FilterSidebar />}
      statsPanel={<StatsPanel />}
    >
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-ocean-50 to-forest-50 dark:from-ocean-950 dark:to-forest-950">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🏖️</div>
          <h2 className="text-2xl font-bold text-ocean-700 dark:text-ocean-300">
            Interactive Beach Map
          </h2>
          <p className="text-muted-foreground">
            The interactive map component will be integrated here, displaying UK beach litter survey data with filtering and visualization capabilities.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div className="p-3 bg-ocean-100/50 dark:bg-ocean-900/20 rounded-lg border border-ocean-200/50 dark:border-ocean-800/50">
              <div className="font-semibold text-ocean-700 dark:text-ocean-300">✅ Layout Ready</div>
              <div className="text-xs text-muted-foreground mt-1">Responsive grid system</div>
            </div>
            <div className="p-3 bg-forest-100/50 dark:bg-forest-900/20 rounded-lg border border-forest-200/50 dark:border-forest-800/50">
              <div className="font-semibold text-forest-700 dark:text-forest-300">✅ Sidebar System</div>
              <div className="text-xs text-muted-foreground mt-1">Collapsible panels</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
