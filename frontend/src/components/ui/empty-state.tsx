export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No videos yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Add your first YouTube video to start building your collection
      </p>
    </div>
  );
}
