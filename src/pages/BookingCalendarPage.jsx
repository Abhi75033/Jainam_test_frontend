import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Home, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function BookingCalendarPage() {
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [byDay, setByDay] = useState({});
  const [bookingsList, setBookingsList] = useState([]);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadCalendarBookings = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/bookings/calendar`, {
        params: { month, year, organizationId: orgId }
      });
      setByDay(res.data.data.byDay || {});
      setBookingsList(res.data.data.bookings || []);
    } catch (e) {
      toast.error("Failed to load booking calendar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarBookings();
  }, [orgId, month, year]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Helper to render calendar days
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i + 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dharamshalaCount = bookingsList.filter(b => b.type === "DHARAMSHALA" || b.type === "ROOM").length;
  const hallsCount = bookingsList.filter(b => b.type === "HALL" || b.type === "COMMUNITY_HALL").length;

  return (
    <div className="space-y-4" data-testid="booking-calendar-page">
      <PageHeader
        title="Reservations Calendar"
        subtitle="Visual grid view tracking all temple halls, bhojanshalas, and room booking requests."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Bookings This Month" value={bookingsList.length} icon={CalendarDays} tone="warning" />
        <StatCard label="Dharamshala Bookings" value={`${dharamshalaCount} Rooms`} icon={Home} tone="default" />
        <StatCard label="Halls Confirmed" value={`${hallsCount} Reservation(s)`} icon={Check} tone="info" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            {monthNames[month - 1]} {year}
          </h3>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="h-24 bg-slate-50/50 rounded-lg"></div>
          ))}

          {days.map((day) => {
            const dayBookings = byDay[day] || [];
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <div key={day} className={`h-24 p-1.5 rounded-lg border flex flex-col gap-1 transition-all ${
                isToday ? "border-orange-500 bg-orange-50/30" : "border-slate-100 hover:border-orange-200 bg-white"
              }`}>
                <span className={`text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                  isToday ? "bg-orange-500 text-white" : "text-slate-600"
                }`}>{day}</span>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {dayBookings.map((b) => (
                    <div key={b.id} className={`text-[8px] px-1 rounded-sm py-0.5 truncate leading-tight font-medium ${
                      b.bookingItem?.type === "DHARAMSHALA" || b.bookingItem?.type === "ROOM" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-orange-100 text-orange-800"
                    }`} title={`${b.member?.fullName} - ${b.bookingItem?.name}`}>
                      {b.member?.fullName || "Guest"}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
