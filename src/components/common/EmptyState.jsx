import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title = "No records yet", description, icon: Icon = Inbox, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-md bg-white/60",
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
