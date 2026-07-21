import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TimePicker — Clock-based time picker component.
 * Renders as a button showing the current time; clicking opens a dropdown
 * with hour/minute/AM-PM selectors.
 * Output format: "HH:MM AM" / "HH:MM PM"
 *
 * Props:
 *   value      — string like "08:00 AM" or "" (controlled)
 *   onChange   — (formattedTime: string) => void
 *   placeholder— string (default "Select time")
 *   disabled   — boolean
 *   className  — extra class names for the trigger button
 *   id         — for label association
 */
export default function TimePicker({
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  className = "",
  id,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse value → { hour, minute, period }
  const parseValue = (v) => {
    if (!v) return { hour: "08", minute: "00", period: "AM" };
    const match = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: "08", minute: "00", period: "AM" };
    return { hour: match[1].padStart(2, "0"), minute: match[2], period: match[3].toUpperCase() };
  };

  const { hour, minute, period } = parseValue(value);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const emitChange = (h, m, p) => {
    onChange?.(`${h}:${m} ${p}`);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 w-full h-9 px-3 rounded-md border border-input bg-background text-sm",
          "hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
          open && "ring-2 ring-ring ring-offset-1"
        )}
        data-testid="time-picker-trigger"
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className={cn("flex-1 text-left", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 bg-popover border border-border rounded-xl shadow-xl p-3 flex gap-3 items-start min-w-[220px]"
          data-testid="time-picker-panel"
        >
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Hour</span>
            <div className="h-48 overflow-y-auto scrollbar-thin flex flex-col gap-0.5 pr-1">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => emitChange(h, minute, period)}
                  className={cn(
                    "w-10 h-7 rounded-md text-sm font-mono font-medium transition-colors",
                    h === hour
                      ? "bg-orange-500 text-white"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="text-lg font-bold text-muted-foreground mt-8 select-none">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Min</span>
            <div className="h-48 overflow-y-auto scrollbar-thin flex flex-col gap-0.5 pr-1">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => emitChange(hour, m, period)}
                  className={cn(
                    "w-10 h-7 rounded-md text-sm font-mono font-medium transition-colors",
                    m === minute
                      ? "bg-orange-500 text-white"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Period</span>
            <div className="flex flex-col gap-1.5 mt-1">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => emitChange(hour, minute, p)}
                  className={cn(
                    "w-12 h-8 rounded-lg text-xs font-bold transition-colors",
                    p === period
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 text-[10px] text-muted-foreground underline hover:text-foreground"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * TimeRangePicker — Two TimePickers (From / To) side by side.
 * Props:
 *   fromValue, toValue — strings
 *   onFromChange, onToChange — callbacks
 *   fromLabel, toLabel — optional labels (default "From", "To")
 */
export function TimeRangePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  fromLabel = "From",
  toLabel = "To",
  disabled = false,
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{fromLabel}</span>
        <TimePicker value={fromValue} onChange={onFromChange} disabled={disabled} className="mt-1" />
      </div>
      <span className="text-muted-foreground mb-2 text-sm">–</span>
      <div className="flex-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{toLabel}</span>
        <TimePicker value={toValue} onChange={onToChange} disabled={disabled} className="mt-1" />
      </div>
    </div>
  );
}
