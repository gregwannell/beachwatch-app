export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Beachwatch Data Explorer</h1>
        <p className="text-lg text-muted-foreground">
          All core dependencies have been successfully installed and configured:
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">✅ React Query v5.x</h2>
            <p className="text-sm text-muted-foreground">Server state management configured</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">✅ shadcn/ui Components</h2>
            <p className="text-sm text-muted-foreground">Charts, forms, and UI components ready</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">✅ Leaflet Maps</h2>
            <p className="text-sm text-muted-foreground">Interactive mapping library installed</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">✅ Sonner Notifications</h2>
            <p className="text-sm text-muted-foreground">Toast notification system ready</p>
          </div>
        </div>
      </div>
    </div>
  )
}
