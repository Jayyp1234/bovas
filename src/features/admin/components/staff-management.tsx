"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { staffRecords } from "../data/staff";

const COLUMNS = [
  "Staff ID",
  "Staff Name",
  "Terminal",
  "Department",
  "Role",
  "Status",
];

function Switch({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-foreground" : "bg-zinc-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function StaffManagement() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIds, setActiveIds] = useState(
    () => new Set(staffRecords.filter((s) => s.active).map((s) => s.id)),
  );

  const rows = staffRecords.filter((member) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      member.id.toLowerCase().includes(q) ||
      member.name.toLowerCase().includes(q) ||
      member.terminal.toLowerCase().includes(q) ||
      member.department.toLowerCase().includes(q)
    );
  });

  function toggle(id: string) {
    setActiveIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Staff Management
      </h1>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Staff"
              aria-label="Search staff"
              className="h-9 pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Filter
              <SlidersHorizontal className="size-3.5" />
            </button>
            <Button size="sm" onClick={() => router.push("/admin/staff/new")}>
              <Plus className="size-4" />
              Add Staff
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                {COLUMNS.map((column) => (
                  <th key={column} className="px-5 py-3 font-medium">
                    {column}
                  </th>
                ))}
                <th className="w-12 px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member) => {
                const active = activeIds.has(member.id);
                return (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/admin/staff/${member.id}`)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {member.id}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {member.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {member.terminal}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {member.department}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {member.role}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Switch checked={active} onClick={() => toggle(member.id)} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${member.name}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                type="button"
                aria-current={page === 3 ? "page" : undefined}
                className={cn(
                  "size-7 rounded-md transition-colors",
                  page === 3
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
