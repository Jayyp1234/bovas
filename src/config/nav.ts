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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shows a small status dot next to the item (e.g. new activity). */
  hasIndicator?: boolean;
  /** Shows a numeric count badge next to the item. */
  badge?: number;
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

/** Dispatch officer sidebar navigation. */
export const dispatchNav: NavItem[] = [
  { label: "Home", href: "/dispatch/dashboard", icon: House },
  {
    label: "Dispatch Queue",
    href: "/dispatch/queue",
    icon: Truck,
    hasIndicator: true,
  },
  { label: "Reports", href: "/dispatch/reports", icon: FileText },
  {
    label: "Waybill History",
    href: "/dispatch/waybill-history",
    icon: History,
  },
  { label: "Support", href: "/dispatch/support", icon: LifeBuoy },
  { label: "Settings", href: "/dispatch/settings", icon: Settings },
];

/** Safety officer sidebar navigation. */
export const safetyNav: NavItem[] = [
  { label: "Tickets Queue", href: "/safety/tickets", icon: Ticket, badge: 35 },
  { label: "History", href: "/safety/history", icon: History },
  { label: "Support", href: "/safety/support", icon: LifeBuoy },
  { label: "Settings", href: "/safety/settings", icon: Settings },
];
