import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  breadcrumbs,
  className,
  testId,
}) {
  return (
    <div className={cn("mb-6", className)} data-testid={testId}>
      {breadcrumbs && (
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          {breadcrumbs}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default PageHeader;
