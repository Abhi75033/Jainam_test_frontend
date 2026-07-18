import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_SECTIONS } from "@/constants/modules";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  LayoutDashboard,
  Users,
  UsersRound,
  HandHeart,
  Landmark,
  Hotel,
  Building2,
  Briefcase,
  ScanLine,
  CalendarCheck,
  HeartHandshake,
  PartyPopper,
  Ticket,
  Armchair,
  Route,
  Newspaper,
  Tag,
  Megaphone,
  ScrollText,
  BarChart3,
  Calendar,
  Sigma,
  MapPin,
  BellRing,
  MessagesSquare,
  Image,
  HandshakeIcon,
  LifeBuoy,
  Bell,
  TrendingUp,
  Settings,
  ClipboardList,
  Search,
  Database,
  UserX,
  Church,
  Home as HomeIcon,
  HelpCircle,
  LayoutTemplate,
  MessageSquareWarning,
  CreditCard,
  CalendarDays,
  PieChart,
  Activity,
  GitBranch,
  Map as MapIcon,
  Footprints,
  BookOpen,
  BadgeIndianRupee,
  Receipt,
  Flame,
  AlertTriangle,
  BarChart2,
  Globe
} from "lucide-react";

// Map each nav route to an icon color tone
const TONE_BY_ROUTE = {
  "/": "yellow",
  "/search": "blue",
  "/members": "blue",
  "/family": "purple",
  "/monks": "orange",
  "/community-pages": "pink",
  "/temples": "orange",
  "/dharamshalas": "green",
  "/jain-centers": "purple",
  "/staff": "teal",
  "/visitors": "blue",
  "/bookings": "green",
  "/donations": "orange",
  "/events": "purple",
  "/tickets": "pink",
  "/seating": "teal",
  "/tours": "orange",
  "/feed": "blue",
  "/offers": "green",
  "/ads": "purple",
  "/news": "orange",
  "/polls": "teal",
  "/calendar": "purple",
  "/counters": "orange",
  "/gallery": "pink",
  "/announcements": "red",
  "/tracking": "blue",
  "/devices": "teal",
  "/alerts": "red",
  "/communication": "blue",
  "/volunteers": "green",
  "/support-tickets": "orange",
  "/notifications": "purple",
  "/reports": "green",
  "/settings": "orange",
  "/audit-logs": "purple",
  "/master-data": "teal",
};

const TONE_HEX = {
  yellow: "#FACC15",
  green: "#10B981",
  orange: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  teal: "#14B8A6",
  pink: "#EC4899",
};

// Flat dictionary of all available items compiled from NAV_SECTIONS + customized overrides
const ALL_ITEMS_MAP = {
  // Overviews
  "DASHBOARD": { to: "/", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
  "SEARCH": { to: "/search", label: "Search Profile", icon: Search, testId: "nav-search" },
  
  // Org Profiles
  "TEMPLES": { to: "/temples", label: "Temple Profile", icon: Landmark, testId: "nav-temples" },
  "DHARAMSHALAS": { to: "/dharamshalas", label: "Dharamshala Profile", icon: Hotel, testId: "nav-dharamshalas" },
  "JAIN_CENTERS": { to: "/jain-centers", label: "Jain Centre Profile", icon: Building2, testId: "nav-jain-centers" },
  
  // Activities
  "EVENTS": { to: "/events", label: "Events Manager", icon: PartyPopper, testId: "nav-events" },
  "TOURS": { to: "/tours", label: "Tours (99 Yatra)", icon: Route, testId: "nav-tours" },
  "CHATURMAS": { to: "/chaturmas", label: "Chaturmas Setup", icon: Flame, testId: "nav-chaturmas" },
  "FEED": { to: "/feed", label: "Community Feed", icon: Newspaper, testId: "nav-feed" },
  "NEWS": { to: "/news", label: "Newsroom Swipe", icon: ScrollText, testId: "nav-news" },
  "ANNOUNCEMENTS": { to: "/announcements", label: "Announcements & Notices", icon: Megaphone, testId: "nav-announcements" },
  "POLLS": { to: "/polls", label: "Polls & Surveys", icon: BarChart3, testId: "nav-polls" },

  // People
  "MEMBERS": { to: "/members", label: "Jain Members", icon: Users, testId: "nav-members" },
  "NON-JAIN-MEMBERS": { to: "/non-jain-members", label: "Non-Jain Members", icon: UserX, testId: "nav-non-jain-members" },
  "MONKS": { to: "/monks", label: "Maharaj Saheb", icon: HandHeart, testId: "nav-monks" },
  "STAFF": { to: "/staff", label: "Staff Directory", icon: Briefcase, testId: "nav-staff" },
  "VOLUNTEERS": { to: "/volunteers", label: "Volunteers Directory", icon: HandshakeIcon, testId: "nav-volunteers" },
  
  // Booking Control
  "BOOKINGS": { to: "/bookings", label: "Booking Requests", icon: CalendarCheck, testId: "nav-bookings" },
  "VISITORS": { to: "/visitors", label: "Visitors Registry", icon: ScanLine, testId: "nav-visitors" },
  
  // Monk Walk Tracking
  "TRACKING": { to: "/tracking", label: "GPS Tracking Map", icon: MapPin, testId: "nav-tracking" },
  "MANUAL-TRACKING": { to: "/manual-tracking", label: "Manual Tracking Logs", icon: Footprints, testId: "nav-manual-tracking" },
  "JOURNEY-LOGS": { to: "/journey-logs", label: "Walk Journey Logs", icon: BookOpen, testId: "nav-journey-logs" },
  "ROUTES": { to: "/routes", label: "Route Planner", icon: GitBranch, testId: "nav-routes" },
  "LIVE-MAP": { to: "/live-map", label: "Monk Live Map", icon: MapIcon, testId: "nav-live-map" },

  // Finances
  "DONATIONS": { to: "/donations", label: "Donations Log", icon: HeartHandshake, testId: "nav-donations" },
  "RECEIPTS": { to: "/receipts", label: "Donation Receipts", icon: Receipt, testId: "nav-receipts" },

  // Contents
  "GALLERY": { to: "/gallery", label: "Media Gallery", icon: Image, testId: "nav-gallery" },
  "CALENDAR": { to: "/calendar", label: "Tithi Timings", icon: Calendar, testId: "nav-calendar" },
  "COUNTERS": { to: "/counters", label: "Bhojanshala Timings", icon: Sigma, testId: "nav-counters" },
  "FAQ": { to: "/faq", label: "FAQ Rules", icon: HelpCircle, testId: "nav-faq" },

  // Reports
  "REPORTS": { to: "/reports", label: "Analytics Reports", icon: TrendingUp, testId: "nav-reports" },

  // Support
  "SUPPORT_TICKETS": { to: "/support-tickets", label: "Support Tickets", icon: LifeBuoy, testId: "nav-support-tickets" },
  "FEEDBACK": { to: "/feedback", label: "Feedback Forms", icon: MessagesSquare, testId: "nav-feedback" },
  "INCORRECT-REPORTS": { to: "/incorrect-reports", label: "Incorrect Info", icon: MessageSquareWarning, testId: "nav-incorrect-reports" },
  "COMMUNICATION": { to: "/communication", label: "Contacts & Chats", icon: MessagesSquare, testId: "nav-communication" },
  
  // Settings
  "SETTINGS": { to: "/settings", label: "System Settings", icon: Settings, testId: "nav-settings" },
  "ADMINS": { to: "/admins", label: "Manage Admins", icon: UsersRound, superAdminOnly: true, testId: "nav-admins" }
};

// Proposed Role-Based Navigation Hierarchy Configurations (§1 to §6)
const ROLE_LAYOUTS = {
  SUPER_ADMIN: null, // Default layout containing everything

  TEMPLE_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🛕 Temple Management",
      items: ["TEMPLES", "GALLERY", "CALENDAR", "FAQ", "COMMUNICATION", "VOLUNTEERS", "CHATURMAS", "COUNTERS", "ANNOUNCEMENTS"]
    },
    {
      label: "🙏 MS Management",
      items: ["MONKS", "ROUTES", "TRACKING", "CHATURMAS"]
    },
    {
      label: "👥 Members Ledger",
      items: ["MEMBERS", "NON-JAIN-MEMBERS", "VOLUNTEERS"]
    },
    {
      label: "👨💼 Staff Management",
      items: ["STAFF"]
    },
    {
      label: "📅 Activities & Events",
      items: ["EVENTS", "POLLS", "ANNOUNCEMENTS", "NEWS", "FEED"]
    },
    {
      label: "🛒 Booking Management",
      items: ["BOOKINGS"]
    },
    {
      label: "💰 Donations & Capital",
      items: ["DONATIONS", "RECEIPTS"]
    },
    {
      label: "👣 Visitors Tracking",
      items: ["VISITORS"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Tickets",
      items: ["SUPPORT_TICKETS", "INCORRECT-REPORTS", "FEEDBACK"]
    },
    {
      label: "⚙️ System Settings",
      items: ["SETTINGS"]
    }
  ],

  DHARAMSHALA_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🏨 Dharamshala Setup",
      items: ["DHARAMSHALAS", "GALLERY", "COMMUNICATION", "FAQ"]
    },
    {
      label: "👥 Members Ledger",
      items: ["MEMBERS"]
    },
    {
      label: "👨💼 Staff Directory",
      items: ["STAFF"]
    },
    {
      label: "🛒 Room Booking Engine",
      items: ["BOOKINGS"]
    },
    {
      label: "🍽 Bhojanshala Pass",
      items: ["COUNTERS"]
    },
    {
      label: "💰 Donations Setup",
      items: ["DONATIONS"]
    },
    {
      label: "👣 Visitors Gate Check",
      items: ["VISITORS"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Desk",
      items: ["SUPPORT_TICKETS"]
    },
    {
      label: "⚙️ Settings",
      items: ["SETTINGS"]
    }
  ],

  TEMPLE_DHARAMSHALA_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🛕 Temple",
      items: ["TEMPLES", "GALLERY", "CALENDAR"]
    },
    {
      label: "🏨 Dharamshala",
      items: ["DHARAMSHALAS", "FAQ"]
    },
    {
      label: "🙏 MS Guidance",
      items: ["MONKS", "ROUTES"]
    },
    {
      label: "👥 Members",
      items: ["MEMBERS"]
    },
    {
      label: "👨💼 Staff",
      items: ["STAFF"]
    },
    {
      label: "📅 Activities",
      items: ["FEED", "EVENTS", "POLLS", "ANNOUNCEMENTS", "NEWS"]
    },
    {
      label: "🛒 Booking Engine",
      items: ["BOOKINGS"]
    },
    {
      label: "🍽 Bhojanshala Pass",
      items: ["COUNTERS"]
    },
    {
      label: "💰 Donations Ledger",
      items: ["DONATIONS", "RECEIPTS"]
    },
    {
      label: "👣 Visitors Entry",
      items: ["VISITORS"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Desk",
      items: ["SUPPORT_TICKETS"]
    },
    {
      label: "⚙️ System Settings",
      items: ["SETTINGS"]
    }
  ],

  JAIN_CENTER_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🏢 Jain Centre Info",
      items: ["JAIN_CENTERS", "GALLERY", "FAQ", "COMMUNICATION", "VOLUNTEERS", "ANNOUNCEMENTS"]
    },
    {
      label: "🙏 MS Guidance",
      items: ["MONKS", "ROUTES", "TRACKING", "CHATURMAS"]
    },
    {
      label: "👥 Members Ledger",
      items: ["MEMBERS"]
    },
    {
      label: "👨💼 Staff Management",
      items: ["STAFF"]
    },
    {
      label: "📅 Activities Feed",
      items: ["FEED", "EVENTS", "POLLS", "ANNOUNCEMENTS", "NEWS"]
    },
    {
      label: "🛒 Room Booking",
      items: ["BOOKINGS"]
    },
    {
      label: "💰 Donations & Capital",
      items: ["DONATIONS", "RECEIPTS"]
    },
    {
      label: "👣 Visitors Registry",
      items: ["VISITORS"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Helpdesk",
      items: ["SUPPORT_TICKETS", "FEEDBACK"]
    },
    {
      label: "⚙️ Settings",
      items: ["SETTINGS"]
    }
  ],

  JAIN_CENTER_DHARAMSHALA_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🏢 Jain Centre Details",
      items: ["JAIN_CENTERS", "GALLERY"]
    },
    {
      label: "🏨 Dharamshala",
      items: ["DHARAMSHALAS", "FAQ"]
    },
    {
      label: "🙏 MS Guidance",
      items: ["MONKS", "ROUTES"]
    },
    {
      label: "👥 Members",
      items: ["MEMBERS"]
    },
    {
      label: "👨💼 Staff Directory",
      items: ["STAFF"]
    },
    {
      label: "📅 Activities",
      items: ["FEED", "EVENTS", "POLLS", "ANNOUNCEMENTS", "NEWS"]
    },
    {
      label: "🛒 Room Booking",
      items: ["BOOKINGS"]
    },
    {
      label: "🍽 Bhojanshala Pass",
      items: ["COUNTERS"]
    },
    {
      label: "💰 Donations Ledger",
      items: ["DONATIONS", "RECEIPTS"]
    },
    {
      label: "👣 Visitors Entry",
      items: ["VISITORS"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Desk",
      items: ["SUPPORT_TICKETS"]
    },
    {
      label: "⚙️ Settings",
      items: ["SETTINGS"]
    }
  ],

  MONK_ADMIN: [
    {
      label: "Overview",
      items: ["DASHBOARD"]
    },
    {
      label: "🙏 MS Profile Info",
      items: ["MONKS", "GALLERY"]
    },
    {
      label: "🚶 JiNANAM Walk Route",
      items: ["TRACKING", "ROUTES", "JOURNEY-LOGS", "LIVE-MAP", "TEMPLES", "JAIN_CENTERS"]
    },
    {
      label: "🛕 Chaturmas Details",
      items: ["CHATURMAS"]
    },
    {
      label: "📅 Activities Feed",
      items: ["FEED", "ANNOUNCEMENTS", "EVENTS", "POLLS"]
    },
    {
      label: "👥 Followers Hub",
      items: ["MEMBERS", "COMMUNICATION"]
    },
    {
      label: "📊 Reports",
      items: ["REPORTS"]
    },
    {
      label: "🎫 Support Desk",
      items: ["SUPPORT_TICKETS", "FEEDBACK"]
    },
    {
      label: "⚙️ Monk Settings",
      items: ["SETTINGS"]
    }
  ]
};

export default function Sidebar({ onNavigate }) {
  const { canDo, user, isSuperAdmin } = useAuth();
  const location = useLocation();

  // Simulated Role State (For Super Admins to review menus)
  const [simulatedRole, setSimulatedRole] = useState(() => {
    return localStorage.getItem("jinanam_simulated_role") || user?.primaryRoleKey || "SUPER_ADMIN";
  });

  const activeRole = isSuperAdmin ? simulatedRole : (user?.primaryRoleKey || "MEMBER");

  const isItemVisible = (item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (!item.moduleKey) return true;
    return canDo(item.moduleKey, "VIEW");
  };

  // Compile active layouts
  const activeLayout = ROLE_LAYOUTS[activeRole] || null;
  const renderedSections = activeLayout
    ? activeLayout.map(sec => {
        const items = sec.items.map(itKey => ALL_ITEMS_MAP[itKey.toUpperCase()]).filter(Boolean);
        return {
          label: sec.label,
          items: items.filter(isItemVisible)
        };
      }).filter(sec => sec.items.length > 0)
    : NAV_SECTIONS;

  return (
    <div
      className="sidebar-navy h-full w-64 shrink-0 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #192857 0%, #111d45 100%)",
        color: "#EFF6FF",
      }}
      data-testid="admin-sidebar"
    >
      {/* Brand */}
      <div className="h-20 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <span className="font-brand text-yellow-300 text-2xl leading-none">ॐ</span>
        </div>
        <div className="leading-tight">
          <div className="font-brand text-xl text-white tracking-wide">JiNANAM</div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-white/60 mt-0.5">
            Connecting Devotion
          </div>
        </div>
      </div>


      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-3 px-3">
          {renderedSections.map((section) => {
            const visibleItems = section.items;
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label} className="mb-5">
                <div className="side-group px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/60">
                  {section.label}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon || LayoutDashboard;
                    const active =
                      item.to === "/"
                        ? location.pathname === "/"
                        : item.to === "/reports"
                        ? location.pathname === "/reports"
                        : location.pathname.startsWith(item.to);
                    const tone = TONE_BY_ROUTE[item.to] || "blue";
                    const hex = TONE_HEX[tone];
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onNavigate}
                          data-testid={item.testId}
                          end={item.to === "/reports" || item.to === "/"}
                          className={cn(
                            "side-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                            active && "active"
                          )}
                        >
                          <span
                            className={cn(
                              "h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-all",
                              active ? "bg-white/20" : ""
                            )}
                            style={
                              active
                                ? {}
                                : { backgroundColor: `${hex}22`, color: hex }
                            }
                          >
                            <Icon
                              className="h-4 w-4"
                              style={active ? { color: "hsl(var(--sidebar-active-fg))" } : {}}
                            />
                          </span>
                          <span className="truncate text-xs font-semibold">{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      {/* App promo card */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-yellow-300" />
            <div className="text-xs font-semibold text-white">JiNANAM App</div>
          </div>
          <div className="text-[10px] text-white/60 leading-relaxed">
            Stay connected with your spiritual journey. Get the mobile app.
          </div>
        </div>
        <div className="text-[10px] text-white/40 text-center mt-3">
          v1.0 · Together in Seva
        </div>
      </div>
    </div>
  );
}
