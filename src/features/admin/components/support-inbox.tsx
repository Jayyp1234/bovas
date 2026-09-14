"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Inbox, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination, ParamTabs } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { formatDepotDate, formatDepotTime } from "@/lib/format";
import { formatTimeAgo } from "@/lib/relative-time";
import { useUrlParams } from "@/lib/use-url-params";
import type { PaginationMeta, SupportRequest } from "@/lib/api/types";
import { setSupportStatusAction } from "@/features/support/actions";

const TABS = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

const EMPTY: Record<string, string> = {
  open: "No open requests. You're all caught up.",
  resolved: "No resolved requests yet.",
  all: "No one has asked for help yet.",
};

interface SupportInboxProps {
  requests: SupportRequest[];
  meta: PaginationMeta;
}

export function SupportInbox({ requests, meta }: SupportInboxProps) {
  const toast = useToast();
  const { get } = useUrlParams();
  const [changingId, setChangingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const tab = get("status") ?? "open";

  function setStatus(request: SupportRequest) {
    setChangingId(request.id);
    startTransition(async () => {
      const result = await setSupportStatusAction(request.id, request.status === "open" ? "resolved" : "open");
      toast(result.message, result.ok ? "success" : "error");
      setChangingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Requests for help from depot staff. Every admin is notified and emailed when one arrives.
        </p>
      </div>

      <Card className="overflow-hidden">
        <ParamTabs param="status" label="Request status" tabs={TABS} defaultValue="open" className="border-b border-border px-5" />

        {requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-6" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">{EMPTY[tab] ?? EMPTY.all}</p>
          </div>
        ) : (
          <ul>
            {requests.map((request) => (
              <li key={request.id} className="border-b border-border px-5 py-4 last:border-0">
                <article className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">{request.subject}</h2>
                      <Badge variant={request.status === "open" ? "warning" : "success"} withDot>
                        {request.status === "open" ? "Open" : "Resolved"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.requester.name} · {request.requester.staff_no} ·{" "}
                      <time
                        dateTime={request.created_at}
                        title={`${formatDepotDate(request.created_at)}, ${formatDepotTime(request.created_at)}`}
                        suppressHydrationWarning
                      >
                        {formatTimeAgo(request.created_at)}
                      </time>
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{request.body}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={changingId === request.id}
                    onClick={() => setStatus(request)}
                    className="shrink-0"
                  >
                    {request.status === "open" ? (
                      <>
                        <CircleCheck className="size-4" aria-hidden />
                        Mark Resolved
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-4" aria-hidden />
                        Reopen
                      </>
                    )}
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="requests" />
      </Card>
    </div>
  );
}
