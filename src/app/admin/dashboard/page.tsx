import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { readChartFilters } from "@/features/dashboard/components/marketer-chart";
import { getDashboardCharts, getDashboardStats } from "@/lib/api/dashboard";
import { listTerminals } from "@/lib/api/terminals";
import { getTicket, listTickets } from "@/lib/api/tickets";
import type { TicketDetail } from "@/lib/api/types";
import { requireRole } from "@/lib/auth/current-user";
import { DEPOT_TIME_ZONE } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Dashboard" };

interface AdminDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Overloaded trucks waiting for a decision, with their loading records. */
async function pendingOverloads(): Promise<TicketDetail[]> {
  const pending = await listTickets({ status: "overload_pending", sort: "created_at", per_page: 20 });
  const tickets = await Promise.all(pending.data.map((ticket) => getTicket(ticket.ticket_no)));
  return tickets.filter((ticket): ticket is TicketDetail => ticket !== null);
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const trucks = readChartFilters(params, "trucks");
  const litres = readChartFilters(params, "litres");

  const [user, stats, trucksChart, litresChart, terminals, overloads] = await Promise.all([
    requireRole("admin"),
    getDashboardStats(),
    getDashboardCharts(trucks),
    getDashboardCharts(litres),
    listTerminals(),
    pendingOverloads(),
  ]);

  return (
    <AdminDashboard
      name={user.name.split(" ")[0]}
      stats={stats}
      trucks={{ ...trucks, data: trucksChart.trucks_per_marketer }}
      litres={{ ...litres, data: litresChart.quantity_per_marketer }}
      overloads={overloads}
      terminals={terminals.data}
      defaultTerminalId={user.terminal.id}
      today={new Intl.DateTimeFormat("en-CA", { timeZone: DEPOT_TIME_ZONE }).format(new Date())}
    />
  );
}
