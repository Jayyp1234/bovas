import {
  House,
  ClipboardList,
  ClipboardCheck,
  FileText,
  Folder,
  History,
  LifeBuoy,
  Settings,
  Users,
  Ticket,
  Truck,
  Fuel,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shows a small status dot next to the item (e.g. new activity). */
  hasIndicator?: boolean;
}

/** Primary sidebar navigation for the logistics dashboard shell. */
export const dashboardNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: House },
  {
    label: "Loading Program",
    href: "/loading-program",
    icon: ClipboardList,
    hasIndicator: true,
  },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Ticket History", href: "/ticket-history", icon: History },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** Admin sidebar navigation. */
export const adminNav: NavItem[] = [
  { label: "Home", href: "/admin/dashboard", icon: House },
  { label: "Audit Log", href: "/admin/audit", icon: ClipboardCheck },
  { label: "Staff Management", href: "/admin/staff", icon: Users },
  {
    label: "Marketers' Records",
    href: "/admin/marketer-records",
    icon: FileText,
  },
  { label: "Reports", href: "/admin/activity-reports", icon: Folder },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/** Safety officer sidebar navigation. */
export const safetyNav: NavItem[] = [
  { label: "Tickets Queue", href: "/safety/tickets", icon: Ticket },
  { label: "History", href: "/safety/history", icon: History },
  { label: "Support", href: "/safety/support", icon: LifeBuoy },
  { label: "Settings", href: "/safety/settings", icon: Settings },
];

/** Dispatch sidebar navigation: one queue for each step after Safety. */
export const dispatchNav: NavItem[] = [
  { label: "Loading Queue", href: "/dispatch/loading", icon: Fuel },
  { label: "Waybills", href: "/dispatch/waybills", icon: FileText },
  { label: "Gate", href: "/dispatch/gate", icon: Truck },
  { label: "Support", href: "/dispatch/support", icon: LifeBuoy },
  { label: "Settings", href: "/dispatch/settings", icon: Settings },
];
