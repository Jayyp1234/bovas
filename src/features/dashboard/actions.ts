"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { createTicket, updateTicket } from "@/lib/api/tickets";
import type { TicketInput } from "@/lib/api/types";
import { toTicketPatch } from "./ticket-values";

export interface SaveTicketFailure {
  message: string;
  fieldErrors: Record<string, string[]>;
}

/**
 * Generates a ticket, or saves changes to `ticketNo`, then opens it. Only failures return:
 * field errors from the API, or why the ticket can't be saved (e.g. Safety already inspected it).
 */
export async function saveTicket(input: TicketInput, ticketNo?: string): Promise<SaveTicketFailure> {
  let saved: string;

  try {
    const ticket = ticketNo
      ? await updateTicket(ticketNo, toTicketPatch(input))
      : await createTicket(input);
    saved = ticket.ticket_no;
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ApiError && error.status < 500) {
      const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
      return {
        message: hasFieldErrors ? "Check the highlighted fields and try again." : error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    console.error(error);
    return {
      message: "We couldn't save the ticket. Check your connection and try again.",
      fieldErrors: {},
    };
  }

  redirect(`/ticket-history/${saved}?saved=${ticketNo ? "updated" : "created"}`);
}
