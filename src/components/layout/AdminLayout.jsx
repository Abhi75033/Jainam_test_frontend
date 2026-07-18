import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";


export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar (opens via topbar hamburger) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 sidebar-navy border-r-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onToggleSidebar={() => setMobileOpen(true)} />
        <main
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 animate-fade-up"
          data-testid="admin-main"
        >
          <Outlet />

        </main>
      </div>

      <MobileBottomNav />
      <Toaster position="top-right" richColors />
    </div>
  );
}
