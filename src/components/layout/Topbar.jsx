import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { Search, Bell, LogOut, User as UserIcon, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { initials } from "@/lib/utils";
import { ROLE_LABELS } from "@/constants/modules";

export default function Topbar({ onToggleSidebar }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeAdmins, setActiveAdmins] = useState(1);

  const { socket, connected } = useSocket(
    "/dashboards",
    {
      "admins:active-count": (evt) => {
        if (evt && typeof evt.count === "number") {
          setActiveAdmins(evt.count);
        }
      },
    },
    { enabled: isSuperAdmin }
  );

  useEffect(() => {
    if (connected && socket && isSuperAdmin) {
      socket.emit("subscribe:platform");
    }
  }, [connected, socket, isSuperAdmin]);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.mobile ||
    "Admin";

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 bg-white border-b border-border flex items-center px-3 md:px-6 gap-2 md:gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onToggleSidebar}
        data-testid="topbar-menu-button"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 md:gap-3 ml-auto shrink-0">
        {/* Active users chip - hidden on mobile */}
        {isSuperAdmin && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-foreground">{activeAdmins} Active Admin{activeAdmins > 1 ? 's' : ''}</span>
          </div>
        )}

        <button
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-full border border-border bg-white flex items-center justify-center hover:bg-secondary/60 transition-colors"
          onClick={() => navigate("/notifications")}
          data-testid="topbar-notifications-button"
        >
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">
            12
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 rounded-full border border-border bg-white hover:bg-secondary/60 transition-colors"
              data-testid="topbar-user-menu"
            >
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {ROLE_LABELS[user?.primaryRoleKey] || "Member"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{user?.mobile}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              data-testid="topbar-menu-settings"
            >
              <UserIcon className="h-4 w-4 mr-2" /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              data-testid="topbar-menu-logout"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
