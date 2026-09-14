"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Dialog } from "@/components/ui/dialog";
import { Pagination, ParamSelect, SearchInput } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { shortRoleTitle } from "@/domain/labels";
import { DEPARTMENTS } from "@/domain/staff";
import type { PaginationMeta, User } from "@/lib/api/types";
import { setStaffActiveAction } from "../staff-actions";

const COLUMNS = ["Staff ID", "Staff Name", "Terminal", "Department", "Role", "Active"];

const DEPARTMENT_OPTIONS = [
  { value: "", label: "All departments" },
  ...DEPARTMENTS.map((department) => ({ value: department, label: department })),
];

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function Switch({
  checked,
  label,
  disabled,
  onClick,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-foreground" : "bg-switch-track",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-surface transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

interface StaffManagementProps {
  staff: User[];
  meta: PaginationMeta;
}

export function StaffManagement({ staff, meta }: StaffManagementProps) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState<User | null>(null);
  const [changingNo, setChangingNo] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function setActive(member: User, active: boolean) {
    setConfirming(null);
    setChangingNo(member.staff_no);
    startTransition(async () => {
      const result = await setStaffActiveAction(member.staff_no, active);
      toast(result.message, result.ok ? "success" : "error");
      setChangingNo(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Staff Management</h1>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput placeholder="Search staff" label="Search staff" className="lg:w-80" />
          <div className="flex flex-wrap items-center gap-2">
            <ParamSelect param="department" label="Filter by department" options={DEPARTMENT_OPTIONS} />
            <ParamSelect param="status" label="Filter by status" options={STATUS_OPTIONS} />
            <Link href="/admin/staff/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="size-4" />
              Add Staff
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <ResponsiveTable className="w-full min-w-[900px] text-sm">
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
              {staff.map((member) => (
                <tr
                  key={member.staff_no}
                  onClick={() => router.push(`/admin/staff/${member.staff_no}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{member.staff_no}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{member.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{member.terminal.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{member.department}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{shortRoleTitle(member.role_title)}</td>
                  <td className="px-5 py-3.5" onClick={(event) => event.stopPropagation()}>
                    <Switch
                      checked={member.active}
                      disabled={changingNo === member.staff_no}
                      label={`${member.active ? "Deactivate" : "Activate"} ${member.name}`}
                      onClick={() => (member.active ? setConfirming(member) : setActive(member, true))}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/staff/${member.staff_no}`}
                      aria-label={`View ${member.name}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <Eye className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No staff match your search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="staff" />
      </Card>

      <Dialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Deactivate Staff Account"
        className="max-w-sm"
        description={
          confirming && (
            <>
              <span className="font-semibold text-foreground">{confirming.name}</span> will be signed out
              and won&apos;t be able to sign in until the account is activated again.
            </>
          )
        }
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={() => confirming && setActive(confirming, false)}>
            Deactivate
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
