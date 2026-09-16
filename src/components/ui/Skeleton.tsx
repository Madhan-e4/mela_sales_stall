export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-[8px] bg-border/80" />
        <div className="h-4 w-28 rounded-[8px] bg-border/60" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[5.5rem] rounded-[14px] border border-border bg-surface"
          />
        ))}
      </div>
      <div className="h-40 rounded-[14px] border border-border bg-surface" />
    </div>
  );
}
