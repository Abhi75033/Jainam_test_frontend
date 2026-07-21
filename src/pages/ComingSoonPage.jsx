/**
 * ComingSoonPage — Placeholder for feature-flagged / not-yet-built modules.
 * Displays the module name and a premium "Coming Soon" message.
 */
import { useLocation } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ComingSoonPage({ moduleName }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive module name from route if not passed as prop
  const derivedName =
    moduleName ||
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(" → ");

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16"
      data-testid="coming-soon-page"
    >
      {/* Animated glow background */}
      <div className="relative mb-10">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, #8b5cf6 50%, transparent 80%)",
            width: 200,
            height: 200,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          }}
        >
          <Sparkles className="w-12 h-12 text-indigo-300" />
        </div>
      </div>

      {/* Badge */}
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
          border: "1px solid rgba(139,92,246,0.3)",
          color: "#a78bfa",
        }}
      >
        <Sparkles className="w-3 h-3" />
        Coming Soon
      </span>

      {/* Title */}
      <h1 className="text-3xl font-black text-slate-800 mb-3 leading-tight">
        {derivedName}
      </h1>

      {/* Subtitle */}
      <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
        This module is currently under development and will be available in an upcoming release.
        Stay tuned — it's going to be great.
      </p>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
        <div
          className="h-full rounded-full animate-pulse"
          style={{
            width: "40%",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          }}
        />
      </div>

      {/* Action */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2 text-slate-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Button>
    </div>
  );
}
