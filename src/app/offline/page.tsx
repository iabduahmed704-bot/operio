export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground">
        Check your connection. Some pages you&apos;ve already visited may still be available.
      </p>
    </div>
  );
}
