export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="text-primary hover:underline"
        >
          Go back home
        </a>
      </div>
    </div>
  )
}
