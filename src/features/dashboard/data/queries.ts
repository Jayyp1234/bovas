import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { LoadingTicket, MarketerDatum } from "@/features/dashboard/types";
import {
  loadingTickets as mockTickets,
  getTicketDetailById as getMockTicketDetailById,
  type TicketDetail,
} from "@/features/dashboard/data/tickets";
import {
  trucksPerMarketer as mockTrucks,
  quantityPerMarketer as mockQuantity,
} from "@/features/dashboard/data/charts";
import type { LoadingTicketRow } from "@/lib/supabase/database.types";

function mapTicketRow(row: LoadingTicketRow): LoadingTicket {
  return {
    id: row.id,
    customer: row.customer,
    truckType: row.truck_type,
    truckNumber: row.truck_number,
    product: row.product,
    quantity: row.quantity,
    destination: row.destination,
    status: row.status,
  };
}

export async function getLoadingTickets(): Promise<LoadingTicket[]> {
  if (!isSupabaseConfigured()) return mockTickets;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loading_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load tickets:", error?.message);
    return mockTickets;
  }

  return data.map(mapTicketRow);
}

export async function getTicketDetailById(
  id: string,
): Promise<TicketDetail | undefined> {
  if (!isSupabaseConfigured()) return getMockTicketDetailById(id);

  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from("loading_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !ticket) {
    return getMockTicketDetailById(id);
  }

  const { data: destinations } = await supabase
    .from("ticket_destinations")
    .select("station, amount, address")
    .eq("ticket_id", id);

  return {
    ...mapTicketRow(ticket),
    terminal: ticket.terminal ?? "Terminal 1",
    requestedAmount: ticket.requested_amount ?? `${ticket.quantity.toLocaleString()} Litres`,
    destinations: destinations ?? [],
    marketerInfo: {
      marketer: ticket.marketer ?? ticket.customer,
      representative: ticket.representative ?? "—",
      phone: ticket.phone ?? "—",
    },
  };
}

export async function getOperationsCounts(tickets?: LoadingTicket[]) {
  const rows = tickets ?? (await getLoadingTickets());
  const generated = rows.length;
  const pending = rows.filter((ticket) => ticket.status === "pending").length;
  const approved = rows.filter((ticket) => ticket.status === "approved").length;

  return {
    generated,
    pending,
    approved,
    lastGeneratedHint:
      generated > 0 ? "Synced from Supabase" : "No tickets yet",
  };
}

export async function getMarketerCharts(): Promise<{
  trucks: MarketerDatum[];
  quantity: MarketerDatum[];
}> {
  if (!isSupabaseConfigured()) {
    return { trucks: mockTrucks, quantity: mockQuantity };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketer_stats")
    .select("marketer, trucks, quantity_requested")
    .eq("recorded_on", new Date().toISOString().slice(0, 10))
    .order("trucks", { ascending: false });

  if (error || !data || data.length === 0) {
    return { trucks: mockTrucks, quantity: mockQuantity };
  }

  return {
    trucks: data.map((row) => ({ marketer: row.marketer, value: row.trucks })),
    quantity: data.map((row) => ({
      marketer: row.marketer,
      value: row.quantity_requested,
    })),
  };
}

