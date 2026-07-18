import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Big colorful stat card matching Vihaar-style dashboards.
 * Left-side colored icon chip + big value + trend line.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaTone = "up",
  icon: Icon,
  tone = "blue",
  testId,
}) {
  const TrendIcon = deltaTone === "down" ? TrendingDown : TrendingUp;
  const deltaColor =
    deltaTone === "down" ? "text-red-600" : "text-emerald-600";

  return (
    <Card
      className={cn(
        "p-3 md:p-5 border-border rounded-xl bg-white transition-all hover:shadow-md hover:-translate-y-[1px]"
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {Icon && (
          <div
            className={cn(
              "icon-chip shrink-0 h-10 w-10 md:h-14 md:w-14",
              tone
            )}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.2} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] md:text-xs font-medium text-muted-foreground truncate">
            {label}
          </div>
          <div className="mt-0.5 md:mt-1 font-heading text-lg md:text-2xl lg:text-[28px] font-bold text-foreground font-mono-num leading-none truncate">
            {value ?? "—"}
          </div>
          {delta && (
            <div className={cn("text-[10px] md:text-xs mt-1 md:mt-2 font-medium flex items-center gap-1 truncate", deltaColor)}>
              <TrendIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{delta}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
