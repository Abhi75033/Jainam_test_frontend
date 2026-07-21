import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleName = searchParams.get("module") || "Feature";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-slate-50 text-center p-6">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold text-2xl animate-pulse">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Module Coming Soon</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm">
          The <strong>{moduleName}</strong> module is currently in development and will be available in a future update.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
