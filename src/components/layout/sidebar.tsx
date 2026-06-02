"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNav, adminNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";

/** Inner navigation, shared by the desktop rail and the mobile drawer. */
export function SidebarContent({ role = "logistics", onNavigate }: { role?: "admin" | "logistics"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : dashboardNav;

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="px-2">
        <Logo />
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {siteConfig.tagline}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.hasIndicator && (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    active ? "bg-primary-foreground" : "bg-danger",
                  )}
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-surface"
      >
        <LogOut className="size-[18px]" aria-hidden />
        Logout
      </Link>
    </div>
  );
}

/** Fixed desktop sidebar rail (hidden below the lg breakpoint). */
export function Sidebar({ role = "logistics" }: { role?: "admin" | "logistics" }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent role={role} />
      </div>
    </aside>
  );
}
