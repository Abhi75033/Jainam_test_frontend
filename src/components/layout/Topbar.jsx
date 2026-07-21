import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { Search, Bell, LogOut, User as UserIcon, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
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
  const [templeSearch, setTempleSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

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

  useEffect(() => {
    if (!templeSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      api.get(`/temples?q=${templeSearch}`)
        .then((res) => {
          const list = res.data?.data?.items || res.data?.data || [];
          setSearchResults(list);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [templeSearch]);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.mobile ||
    "Admin";

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 bg-white border-b border-border flex items-center px-3 md:px-6 gap-2 md:gap-3">
      {/* Hamburger — mobile only triggers sheet, desktop is decorative brand */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onToggleSidebar}
        data-testid="topbar-menu-button"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Prominent Admin Greeting */}
      <div className="hidden sm:flex flex-col ml-2 leading-none shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Control</span>
        <span className="text-sm font-black text-slate-800 mt-0.5">Welcome, {name}</span>
      </div>

      {/* Global search bar for active temples */}
      <div className="relative hidden md:block max-w-xs w-full ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={templeSearch}
            onChange={(e) => {
              setTempleSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search active temples..."
            className="pl-9 text-xs h-9 bg-slate-50 border-slate-200 rounded-lg w-full focus:bg-white transition-all"
          />
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-1 space-y-0.5">
            {searchResults.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  navigate(`/temples/${t.id}`);
                  setTempleSearch("");
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-medium text-slate-700 flex flex-col"
              >
                <span className="font-bold">{t.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{t.city || 'India'}{t.state ? `, ${t.state}` : ""}</span>
              </button>
            ))}
          </div>
        )}
      </div>


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
