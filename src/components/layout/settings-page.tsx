import type { ReactNode } from "react";

/** The heading and width every workspace's Settings page shares. */
export function SettingsPage({ children, tabs }: { children: ReactNode; tabs?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        {tabs && <div className="mt-3 border-b border-border">{tabs}</div>}
      </div>
      {children}
    </div>
  );
}
