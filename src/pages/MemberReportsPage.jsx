import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function MemberReportsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalJain: 0,
    totalNonJain: 0,
    total: 0,
    activePercent: 0,
    chartData: []
  });

  const loadReport = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary/members/org/${orgId}`);
      setData(res.data.data);
    } catch (e) {
      toast.error("Failed to load member enrollment report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return (
    <div className="space-y-4" data-testid="member-reports-page">
      <PageHeader
        title="Member Enrollment Report"
        subtitle="Geographic segmentation and category splits for Jain and Non-Jain community registrations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Jain Members" value={loading ? "..." : data.totalJain.toLocaleString()} icon={Users} tone="warning" />
        <StatCard label="Non-Jain Members" value={loading ? "..." : data.totalNonJain.toLocaleString()} icon={UserCheck} tone="default" />
        <StatCard label="Active Accounts" value={loading ? "..." : `${data.activePercent}%`} icon={ShieldCheck} tone="info" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white">
        <div className="text-sm font-semibold text-slate-800 mb-4">Enrollment distribution by major hubs</div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Jain" fill="#f97316" radius={[4, 4, 0, 0]} name="Jain Members" />
              <Bar dataKey="NonJain" fill="#64748b" radius={[4, 4, 0, 0]} name="Non-Jain Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
