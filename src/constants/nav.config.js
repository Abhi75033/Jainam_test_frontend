/**
 * nav.config.js — JiNANAM Master Navigation Configuration
 *
 * Single source of truth for sidebar navigation.
 * Supports two layout modes:
 *   - "flat"   : Option 1 — all items in simple one-level groups
 *   - "nested" : Option 2 — full tree with collapsible sub-groups (default)
 *
 * Each node shape:
 * {
 *   id:          string  — unique key
 *   label:       string  — display text
 *   icon:        LucideIcon
 *   route:       string | null  — null for group headers
 *   roles:       string[]       — empty = visible to all authenticated users
 *   featureFlag: string | null  — null = always shown; string = behind flag (renders Coming Soon)
 *   children:    NavNode[]      — sub-items (used in nested mode)
 * }
 *
 * To switch layout: set NAV_LAYOUT in localStorage or change the default below.
 */

import {
  LayoutDashboard, Users, UsersRound, HandHeart, Landmark, Hotel, Building2,
  Briefcase, ScanLine, CalendarCheck, HeartHandshake, PartyPopper,
  Route, Newspaper, Tag, Megaphone, ScrollText, BarChart3, Calendar,
  Sigma, MapPin, BellRing, MessagesSquare, Image, HandshakeIcon,
  LifeBuoy, Bell, TrendingUp, Settings, ClipboardList, Database,
  UserX, Home as HomeIcon, HelpCircle, LayoutTemplate, MessageSquareWarning,
  CreditCard, PieChart, Activity, GitBranch, Map as MapIcon, Footprints,
  BookOpen, BadgeIndianRupee, Receipt, Flame, BarChart2, Globe,
  UserCheck, ShieldCheck, FileText, Download, Upload, Star, Phone,
  CheckSquare, Banknote, Building, Users2, FolderOpen, Clock, AlertTriangle,
  BarChart, FilePieChart, Package, Gift, Ticket, Armchair, Flag,
} from "lucide-react";

// ─── Layout mode ─────────────────────────────────────────────────────────────
// "flat" = Option 1; "nested" = Option 2 (default)
export const NAV_LAYOUT =
  localStorage.getItem("jinanam_nav_layout") || "nested";

export function setNavLayout(mode) {
  localStorage.setItem("jinanam_nav_layout", mode);
  window.location.reload();
}

// ─── Role constants ───────────────────────────────────────────────────────────
export const ROLES = {
  SA: "SUPER_ADMIN",
  TEMPLE: "TEMPLE_ADMIN",
  DHARAMSHALA: "DHARAMSHALA_ADMIN",
  JAIN_CENTER: "JAIN_CENTER_ADMIN",
  MONK: "MONK_ADMIN",
  STAFF: "STAFF",
};

// ─── FLAT NAV CONFIG (Option 1) ───────────────────────────────────────────────
export const FLAT_NAV = [
  {
    id: "sa-dashboard",
    label: "SA Dashboard",
    icon: LayoutDashboard,
    route: "/sa-dashboard",
    roles: [ROLES.SA],
    featureFlag: null,
    children: [],
  },
  {
    id: "a-dashboard",
    label: "A Dashboard",
    icon: LayoutDashboard,
    route: "/",
    roles: [],
    featureFlag: null,
    children: [],
  },
  // ─── Organizations ─────────────────────────────────────────────────────────
  { id: "flat-orgs-sep", label: "Organizations", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-temples", label: "Temple", icon: Landmark, route: "/temples", roles: [], featureFlag: null, children: [] },
  { id: "flat-jain-centers", label: "Jain Centre", icon: Building2, route: "/jain-centers", roles: [], featureFlag: null, children: [] },
  { id: "flat-dharamshalas", label: "Dharamshala", icon: Hotel, route: "/dharamshalas", roles: [], featureFlag: null, children: [] },
  { id: "flat-bhojanshala", label: "Bhojanshala", icon: Sigma, route: "/bhojanshala", roles: [], featureFlag: "FEAT_BHOJANSHALA", children: [] },
  { id: "flat-stanaks", label: "Sthanaks", icon: HomeIcon, route: "/stanaks", roles: [], featureFlag: null, children: [] },
  { id: "flat-community-pages", label: "Community Pages", icon: Globe, route: "/community-pages", roles: [], featureFlag: null, children: [] },
  // ─── People ────────────────────────────────────────────────────────────────
  { id: "flat-people-sep", label: "People", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-members", label: "Jain Members", icon: Users, route: "/members", roles: [], featureFlag: null, children: [] },
  { id: "flat-non-jain", label: "Non-Jain Members", icon: UserX, route: "/non-jain-members", roles: [], featureFlag: null, children: [] },
  { id: "flat-family", label: "Family", icon: UsersRound, route: "/family", roles: [], featureFlag: null, children: [] },
  { id: "flat-volunteers", label: "Volunteers", icon: HandshakeIcon, route: "/volunteers", roles: [], featureFlag: null, children: [] },
  { id: "flat-ms", label: "MS", icon: HandHeart, route: "/monks", roles: [], featureFlag: null, children: [] },
  { id: "flat-staff", label: "Staff", icon: Briefcase, route: "/staff", roles: [], featureFlag: null, children: [] },
  // ─── Communication ─────────────────────────────────────────────────────────
  { id: "flat-comm-sep", label: "Communication", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-feed", label: "Feed", icon: Newspaper, route: "/feed", roles: [], featureFlag: null, children: [] },
  { id: "flat-events", label: "Events", icon: PartyPopper, route: "/events", roles: [], featureFlag: null, children: [] },
  { id: "flat-announcements", label: "Announcements", icon: Megaphone, route: "/announcements", roles: [], featureFlag: null, children: [] },
  { id: "flat-news", label: "News", icon: ScrollText, route: "/news", roles: [], featureFlag: null, children: [] },
  { id: "flat-polls", label: "Polls", icon: BarChart3, route: "/polls", roles: [], featureFlag: null, children: [] },
  { id: "flat-notifications", label: "Notifications", icon: Bell, route: "/notifications", roles: [], featureFlag: null, children: [] },
  { id: "flat-tours", label: "Tours", icon: Route, route: "/tours", roles: [], featureFlag: null, children: [] },
  { id: "flat-99mgmt", label: "99 Management", icon: Star, route: "/tour-jatra", roles: [], featureFlag: null, children: [] },
  { id: "flat-varshitap", label: "Varshitap Management", icon: Flame, route: "/varshitap", roles: [], featureFlag: "FEAT_VARSHITAP", children: [] },
  // ─── Bookings ──────────────────────────────────────────────────────────────
  { id: "flat-bookings-sep", label: "Bookings", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-booking-setup", label: "Booking Setup", icon: Settings, route: "/bookings?tab=setup", roles: [], featureFlag: null, children: [] },
  { id: "flat-booking-cats", label: "Categories", icon: FolderOpen, route: "/bookings?tab=categories", roles: [], featureFlag: null, children: [] },
  { id: "flat-booking-requests", label: "Requests", icon: CalendarCheck, route: "/bookings", roles: [], featureFlag: null, children: [] },
  { id: "flat-booking-calendar", label: "Calendar", icon: Calendar, route: "/booking-calendar", roles: [], featureFlag: null, children: [] },
  // ─── Operations ────────────────────────────────────────────────────────────
  { id: "flat-ops-sep", label: "Operations", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-visitors", label: "Visitors", icon: ScanLine, route: "/visitors", roles: [], featureFlag: null, children: [] },
  { id: "flat-gps", label: "GPS", icon: MapPin, route: "/tracking", roles: [], featureFlag: null, children: [] },
  { id: "flat-routes", label: "Routes", icon: GitBranch, route: "/routes", roles: [], featureFlag: null, children: [] },
  { id: "flat-journey-logs", label: "Journey Logs", icon: BookOpen, route: "/journey-logs", roles: [], featureFlag: null, children: [] },
  { id: "flat-live-map", label: "Live Map", icon: MapIcon, route: "/live-map", roles: [], featureFlag: null, children: [] },
  { id: "flat-attendance", label: "Attendance", icon: CheckSquare, route: "/attendance", roles: [], featureFlag: "FEAT_ATTENDANCE", children: [] },
  // ─── Finance ───────────────────────────────────────────────────────────────
  { id: "flat-finance-sep", label: "Finance", icon: null, route: null, roles: [], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-donations", label: "Donations", icon: HeartHandshake, route: "/donations", roles: [], featureFlag: null, children: [] },
  { id: "flat-receipts", label: "Receipts", icon: Receipt, route: "/receipts", roles: [], featureFlag: null, children: [] },
  { id: "flat-sponsors", label: "Sponsors", icon: Banknote, route: "/sponsors", roles: [], featureFlag: "FEAT_SPONSORS", children: [] },
  { id: "flat-offers", label: "Offers", icon: Tag, route: "/offers", roles: [], featureFlag: null, children: [] },
  { id: "flat-ads", label: "Advertisements", icon: Megaphone, route: "/ads", roles: [], featureFlag: null, children: [] },
  // ─── Admin Management ──────────────────────────────────────────────────────
  { id: "flat-admin-sep", label: "Admin Management", icon: null, route: null, roles: [ROLES.SA], featureFlag: null, children: [], isSeparator: true },
  { id: "flat-admins", label: "Admin Users", icon: UsersRound, route: "/admins", roles: [ROLES.SA], featureFlag: null, children: [] },
  { id: "flat-roles", label: "Roles & Permission Assignment", icon: ShieldCheck, route: "/settings?tab=roles", roles: [ROLES.SA], featureFlag: null, children: [] },
  { id: "flat-login-history", label: "Login History", icon: ClipboardList, route: "/audit-logs", roles: [ROLES.SA], featureFlag: null, children: [] },
  { id: "flat-account-status", label: "Account Status", icon: UserCheck, route: "/admins?tab=status", roles: [ROLES.SA], featureFlag: null, children: [] },
  // ─── Reports / Support / Activity Logs / Settings ──────────────────────────
  { id: "flat-reports", label: "Reports", icon: TrendingUp, route: "/reports", roles: [], featureFlag: null, children: [] },
  { id: "flat-support", label: "Support", icon: LifeBuoy, route: "/support-tickets", roles: [], featureFlag: null, children: [] },
  { id: "flat-activity-logs", label: "Activity Logs", icon: ClipboardList, route: "/audit-logs", roles: [], featureFlag: null, children: [] },
  { id: "flat-settings", label: "Settings", icon: Settings, route: "/settings", roles: [ROLES.SA], featureFlag: null, children: [] },
];

// ─── NESTED NAV CONFIG (Option 2) ─────────────────────────────────────────────
export const NESTED_NAV = [
  // ─── Standalone ─────────────────────────────────────────────────────────────
  {
    id: "sa-dashboard",
    label: "SA Dashboard",
    icon: LayoutDashboard,
    route: "/sa-dashboard",
    roles: [ROLES.SA],
    featureFlag: null,
    children: [],
  },
  {
    id: "a-dashboard",
    label: "A Dashboard",
    icon: LayoutDashboard,
    route: "/",
    roles: [],
    featureFlag: null,
    children: [],
  },

  // ─── People ───────────────────────────────────────────────────────────────
  {
    id: "people",
    label: "People",
    icon: Users2,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      {
        id: "people-members",
        label: "Members",
        icon: Users,
        route: null,
        roles: [],
        featureFlag: null,
        children: [
          { id: "jain-members", label: "Jain Members", icon: Users, route: "/members", roles: [], featureFlag: null, children: [] },
          { id: "non-jain-members", label: "Non-Jain Members", icon: UserX, route: "/non-jain-members", roles: [], featureFlag: null, children: [] },
          { id: "family-mgmt", label: "Family Management", icon: UsersRound, route: "/family", roles: [], featureFlag: null, children: [] },
          { id: "member-requests", label: "Member Requests", icon: UserCheck, route: "/people/member-requests", roles: [], featureFlag: "FEAT_MEMBER_REQUESTS", children: [] },
          { id: "member-verification", label: "Member Verification", icon: ShieldCheck, route: "/people/member-verification", roles: [], featureFlag: "FEAT_MEMBER_VERIFICATION", children: [] },
          { id: "family-groups", label: "Family Groups", icon: UsersRound, route: "/people/family-groups", roles: [], featureFlag: "FEAT_FAMILY_GROUPS", children: [] },
          { id: "import-members", label: "Import Members", icon: Upload, route: "/members/bulk-import", roles: [], featureFlag: null, children: [] },
          { id: "export-members", label: "Export Members", icon: Download, route: "/people/export-members", roles: [], featureFlag: "FEAT_EXPORT_MEMBERS", children: [] },
        ],
      },
      {
        id: "people-volunteers",
        label: "Volunteers",
        icon: HandshakeIcon,
        route: null,
        roles: [],
        featureFlag: null,
        children: [
          { id: "volunteer-mgmt", label: "Volunteer Management", icon: HandshakeIcon, route: "/volunteers", roles: [], featureFlag: null, children: [] },
          { id: "volunteer-registration", label: "Volunteer Registration", icon: UserCheck, route: "/people/volunteer-registration", roles: [], featureFlag: "FEAT_VOL_REGISTRATION", children: [] },
          { id: "volunteer-assignment", label: "Volunteer Assignment", icon: CheckSquare, route: "/people/volunteer-assignment", roles: [], featureFlag: "FEAT_VOL_ASSIGNMENT", children: [] },
          { id: "volunteer-attendance", label: "Volunteer Attendance", icon: ClipboardList, route: "/people/volunteer-attendance", roles: [], featureFlag: "FEAT_VOL_ATTENDANCE", children: [] },
          { id: "volunteer-reports", label: "Volunteer Reports", icon: BarChart, route: "/people/volunteer-reports", roles: [], featureFlag: "FEAT_VOL_REPORTS", children: [] },
        ],
      },
      {
        id: "people-ms",
        label: "MS Management",
        icon: HandHeart,
        route: null,
        roles: [],
        featureFlag: null,
        children: [
          { id: "ms-profiles", label: "MS Profiles", icon: HandHeart, route: "/monks", roles: [], featureFlag: null, children: [] },
          { id: "ms-guru-hierarchy", label: "Guru Hierarchy", icon: GitBranch, route: "/ms/guru-hierarchy", roles: [], featureFlag: "FEAT_GURU_HIERARCHY", children: [] },
          { id: "ms-groups", label: "MS Groups", icon: UsersRound, route: "/ms/groups", roles: [], featureFlag: "FEAT_MS_GROUPS", children: [] },
          { id: "ms-associations", label: "MS Associations", icon: HandshakeIcon, route: "/ms/ms-associations", roles: [], featureFlag: "FEAT_MS_ASSOCIATIONS", children: [] },
          { id: "ms-current-route", label: "Current Route", icon: MapPin, route: "/ms-tracking", roles: [], featureFlag: null, children: [] },
          { id: "ms-route-planning", label: "Route Planning", icon: GitBranch, route: "/ms/route-planning", roles: [], featureFlag: "FEAT_ROUTE_PLANNING", children: [] },
          { id: "ms-journey-history", label: "Journey History", icon: BookOpen, route: "/journey-logs", roles: [], featureFlag: null, children: [] },
          { id: "ms-chaturmas", label: "Chaturmas", icon: Flame, route: "/chaturmas", roles: [], featureFlag: null, children: [] },
          { id: "ms-tapasya", label: "Tapasya", icon: Star, route: "/monks?tab=tapasya", roles: [], featureFlag: null, children: [] },
          { id: "ms-timeline", label: "Timeline", icon: Clock, route: "/monks?tab=timeline", roles: [], featureFlag: null, children: [] },
          { id: "ms-followers", label: "Followers", icon: Users, route: "/monks?tab=followers", roles: [], featureFlag: null, children: [] },
        ],
      },
      {
        id: "people-staff",
        label: "Staff",
        icon: Briefcase,
        route: null,
        roles: [],
        featureFlag: null,
        children: [
          { id: "staff-mgmt", label: "Staff Management", icon: Briefcase, route: "/staff", roles: [], featureFlag: null, children: [] },
          { id: "staff-registration", label: "Staff Registration", icon: UserCheck, route: "/staff?action=new", roles: [], featureFlag: null, children: [] },
          { id: "staff-qr", label: "Staff QR Cards", icon: ScanLine, route: "/staff?tab=qr", roles: [], featureFlag: null, children: [] },
          { id: "staff-attendance", label: "Attendance", icon: CheckSquare, route: "/staff?tab=attendance", roles: [], featureFlag: null, children: [] },
          { id: "staff-leave", label: "Leave Management", icon: Calendar, route: "/staff?tab=leave", roles: [], featureFlag: null, children: [] },
          { id: "staff-documents", label: "Documents", icon: FileText, route: "/staff?tab=documents", roles: [], featureFlag: null, children: [] },
          { id: "staff-hours", label: "Working Hours", icon: Clock, route: "/staff?tab=hours", roles: [], featureFlag: null, children: [] },
        ],
      },
      {
        id: "people-committee",
        label: "Committee",
        icon: Users2,
        route: null,
        roles: [],
        featureFlag: "FEAT_COMMITTEE",
        children: [
          { id: "committee-members", label: "Committee Members", icon: Users, route: "/people/committee/members", roles: [], featureFlag: "FEAT_COMMITTEE", children: [] },
          { id: "committee-designations", label: "Designations", icon: Flag, route: "/people/committee/designations", roles: [], featureFlag: "FEAT_COMMITTEE", children: [] },
          { id: "committee-directory", label: "Contact Directory", icon: Phone, route: "/people/committee/directory", roles: [], featureFlag: "FEAT_COMMITTEE", children: [] },
        ],
      },
    ],
  },

  // ─── Organizations ────────────────────────────────────────────────────────
  {
    id: "organizations",
    label: "Organizations",
    icon: Building,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      {
        id: "org-temples",
        label: "Temple",
        icon: Landmark,
        route: "/temples",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "org-jain-centers",
        label: "Jain Centre",
        icon: Building2,
        route: "/jain-centers",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "org-dharamshalas",
        label: "Dharamshala",
        icon: Hotel,
        route: "/dharamshalas",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "org-bhojanshala",
        label: "Bhojanshala",
        icon: Sigma,
        route: "/bhojanshala",
        roles: [],
        featureFlag: "FEAT_BHOJANSHALA",
        children: [],
      },
      {
        id: "org-stanaks",
        label: "Sthanaks",
        icon: HomeIcon,
        route: "/stanaks",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "org-community-pages",
        label: "Community Pages",
        icon: Globe,
        route: "/community-pages",
        roles: [],
        featureFlag: null,
        children: [],
      },
    ],
  },

  // ─── Community ────────────────────────────────────────────────────────────
  {
    id: "community",
    label: "Community",
    icon: MessagesSquare,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      {
        id: "community-feed",
        label: "Feed",
        icon: Newspaper,
        route: "/feed",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-events",
        label: "Events",
        icon: PartyPopper,
        route: "/events",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-news",
        label: "News",
        icon: ScrollText,
        route: "/news",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-announcements",
        label: "Announcements",
        icon: Megaphone,
        route: "/announcements",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-polls",
        label: "Polls",
        icon: BarChart3,
        route: "/polls",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-tours",
        label: "Tours",
        icon: Route,
        route: "/tours",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-99mgmt",
        label: "99 Management",
        icon: Star,
        route: "/tour-jatra",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-counters",
        label: "Spiritual Counter",
        icon: Sigma,
        route: "/counters",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-calendar",
        label: "Tithi Calendar",
        icon: Calendar,
        route: "/calendar",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-notifications",
        label: "Notifications",
        icon: Bell,
        route: "/notifications",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "community-varshitap",
        label: "Varshitap Management",
        icon: Flame,
        route: "/varshitap",
        roles: [],
        featureFlag: "FEAT_VARSHITAP",
        children: [],
      },
    ],
  },

  // ─── Bookings ─────────────────────────────────────────────────────────────
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      { id: "booking-categories", label: "Booking Categories", icon: FolderOpen, route: "/bookings?tab=categories", roles: [], featureFlag: null, children: [] },
      { id: "booking-resources", label: "Booking Resources", icon: Package, route: "/bookings?tab=resources", roles: [], featureFlag: null, children: [] },
      { id: "booking-management", label: "Booking Management", icon: CalendarCheck, route: "/bookings", roles: [], featureFlag: null, children: [] },
      { id: "booking-pricing", label: "Pricing & Availability", icon: Tag, route: "/bookings?tab=pricing", roles: [], featureFlag: null, children: [] },
      { id: "booking-calendar", label: "Calendar", icon: Calendar, route: "/booking-calendar", roles: [], featureFlag: null, children: [] },
      { id: "booking-checkin", label: "Check-In / Check-Out", icon: ScanLine, route: "/visitors?tab=checkin", roles: [], featureFlag: null, children: [] },
      { id: "booking-reports", label: "Reports", icon: BarChart, route: "/reports?section=bookings", roles: [], featureFlag: null, children: [] },
    ],
  },

  // ─── Finance ──────────────────────────────────────────────────────────────
  {
    id: "finance",
    label: "Finance",
    icon: BadgeIndianRupee,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      {
        id: "finance-donations",
        label: "Donations",
        icon: HeartHandshake,
        route: "/donations",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "finance-bank",
        label: "Bank & Payment",
        icon: Banknote,
        route: "/settings?tab=banking",
        roles: [ROLES.SA],
        featureFlag: null,
        children: [],
      },
      {
        id: "finance-sponsors",
        label: "Sponsors",
        icon: Star,
        route: "/sponsors",
        roles: [],
        featureFlag: "FEAT_SPONSORS",
        children: [],
      },
      {
        id: "finance-ads",
        label: "Advertisements",
        icon: Megaphone,
        route: "/ads",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "finance-offers",
        label: "Offers & Benefits",
        icon: Tag,
        route: "/offers",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "finance-reports",
        label: "Reports",
        icon: FilePieChart,
        route: "/reports?section=finance",
        roles: [],
        featureFlag: null,
        children: [],
      },
    ],
  },

  // ─── Operations ───────────────────────────────────────────────────────────
  {
    id: "operations",
    label: "Operations",
    icon: Activity,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      {
        id: "ops-visitors",
        label: "Visitor Management",
        icon: ScanLine,
        route: "/visitors",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "ops-ms-tracking",
        label: "MS Tracking",
        icon: MapPin,
        route: "/ms-tracking",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "ops-staff-ops",
        label: "Staff Operations",
        icon: Briefcase,
        route: "/staff?tab=attendance",
        roles: [],
        featureFlag: null,
        children: [],
      },
      {
        id: "ops-documents",
        label: "Document Management",
        icon: FileText,
        route: "/operations/documents",
        roles: [],
        featureFlag: "FEAT_ORG_DOCS",
        children: [],
      },
      {
        id: "ops-tasks",
        label: "Task Management",
        icon: CheckSquare,
        route: "/operations/tasks",
        roles: [],
        featureFlag: "FEAT_TASK_MGMT",
        children: [],
      },
      {
        id: "ops-reports",
        label: "Reports",
        icon: BarChart,
        route: "/reports?section=operations",
        roles: [],
        featureFlag: null,
        children: [],
      },
    ],
  },

  // ─── Reports & Analytics ──────────────────────────────────────────────────
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: TrendingUp,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      { id: "reports-exec", label: "Executive Dashboard", icon: PieChart, route: "/reports", roles: [], featureFlag: null, children: [] },
      { id: "reports-people", label: "People Reports", icon: Users, route: "/reports/members", roles: [], featureFlag: null, children: [] },
      { id: "reports-orgs", label: "Organization Reports", icon: Building, route: "/reports?section=orgs", roles: [], featureFlag: null, children: [] },
      { id: "reports-community", label: "Community Reports", icon: MessagesSquare, route: "/reports/events", roles: [], featureFlag: null, children: [] },
      { id: "reports-bookings", label: "Booking Reports", icon: CalendarCheck, route: "/reports?section=bookings", roles: [], featureFlag: null, children: [] },
      { id: "reports-finance", label: "Financial Reports", icon: BadgeIndianRupee, route: "/reports/donations", roles: [], featureFlag: null, children: [] },
      { id: "reports-ops", label: "Operations Reports", icon: Activity, route: "/reports?section=ops", roles: [], featureFlag: null, children: [] },
      { id: "reports-export", label: "Export Center", icon: Download, route: "/reports?section=export", roles: [], featureFlag: null, children: [] },
    ],
  },

  // ─── Support ──────────────────────────────────────────────────────────────
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    route: null,
    roles: [],
    featureFlag: null,
    children: [
      { id: "support-tickets", label: "Support Tickets", icon: LifeBuoy, route: "/support-tickets", roles: [], featureFlag: null, children: [] },
      { id: "support-feedback", label: "Feedback", icon: MessagesSquare, route: "/feedback", roles: [], featureFlag: null, children: [] },
      { id: "support-incorrect", label: "Incorrect Information", icon: MessageSquareWarning, route: "/incorrect-reports", roles: [], featureFlag: null, children: [] },
      { id: "support-contact-requests", label: "Contact Requests", icon: Phone, route: "/support/callback-requests", roles: [], featureFlag: "FEAT_CALLBACKS", children: [] },
      { id: "support-faq", label: "Knowledge Base", icon: HelpCircle, route: "/faq", roles: [], featureFlag: null, children: [] },
    ],
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: null,
    roles: [ROLES.SA],
    featureFlag: null,
    children: [
      { id: "settings-admin-mgmt", label: "Admin Management", icon: UsersRound, route: "/admins", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-roles", label: "Roles & Permissions", icon: ShieldCheck, route: "/settings?tab=roles", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-master-data", label: "Master Data", icon: Database, route: "/master-data", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-notifications", label: "Notification Center", icon: Bell, route: "/notifications", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-platform", label: "Platform Settings", icon: LayoutTemplate, route: "/settings", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-payment", label: "Payment Settings", icon: CreditCard, route: "/settings/payment-settings", roles: [ROLES.SA], featureFlag: "FEAT_PAYMENT_SETTINGS", children: [] },
      { id: "settings-security", label: "Security", icon: ShieldCheck, route: "/audit-logs", roles: [ROLES.SA], featureFlag: null, children: [] },
      { id: "settings-subscription", label: "Subscription", icon: CreditCard, route: "/subscription-plans", roles: [ROLES.SA], featureFlag: null, children: [] },
    ],
  },
];

// ─── Icon color tones per route ───────────────────────────────────────────────
export const ROUTE_TONES = {
  "/": "yellow",
  "/sa-dashboard": "yellow",
  "/members": "blue",
  "/non-jain-members": "blue",
  "/family": "purple",
  "/monks": "orange",
  "/community-pages": "pink",
  "/temples": "orange",
  "/dharamshalas": "green",
  "/jain-centers": "purple",
  "/stanaks": "teal",
  "/bhojanshala": "orange",
  "/staff": "teal",
  "/visitors": "blue",
  "/bookings": "green",
  "/booking-calendar": "green",
  "/donations": "orange",
  "/receipts": "orange",
  "/events": "purple",
  "/tours": "orange",
  "/tour-jatra": "orange",
  "/chaturmas": "red",
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
  "/ms-tracking": "blue",
  "/manual-tracking": "blue",
  "/journey-logs": "blue",
  "/routes": "teal",
  "/live-map": "blue",
  "/volunteers": "green",
  "/support-tickets": "orange",
  "/notifications": "purple",
  "/reports": "green",
  "/settings": "orange",
  "/audit-logs": "purple",
  "/master-data": "teal",
  "/admins": "blue",
  "/subscription-plans": "teal",
  "/feedback": "purple",
  "/incorrect-reports": "red",
  "/faq": "teal",
  "/banners": "pink",
  "/home-sections": "pink",
  "/members/bulk-import": "blue",
};

export const TONE_HEX = {
  yellow: "#FACC15",
  green: "#10B981",
  orange: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  teal: "#14B8A6",
  pink: "#EC4899",
};
