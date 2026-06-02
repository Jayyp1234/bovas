import type { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

/** Empty-state scaffold for routes that exist in the nav but aren't built yet. */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface/60 p-10 text-center">
        {Icon && (
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </span>
        )}
        <p className="text-sm font-medium text-foreground">
          {title} is coming soon
        </p>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
