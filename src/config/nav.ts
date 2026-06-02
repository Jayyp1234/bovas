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
