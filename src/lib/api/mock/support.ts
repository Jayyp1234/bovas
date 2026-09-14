import { ApiError } from "../client";
import type { SupportRequest, SupportRequestInput, SupportRequestPage, SupportRequestQuery, SupportStatus, User } from "../types";
import { notifyRole } from "./notifications";
import { VALIDATION_MESSAGE, nowTimestamp } from "./shared";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Newest first. Matches bovas-api's demo seed. */
const requests: SupportRequest[] = [
  {
    id: 2,
    subject: "Add a first aid kit check",
    body: "Can the safety checklist include a first aid kit? Drivers are asking whether it is required.",
    status: "open",
    requester: { staff_no: "BO003", name: "Abdullah Aiyedun" },
    created_at: minutesAgo(25),
  },
  {
    id: 1,
    subject: "Waybill printer at the gate",
    body: "The printer at the gate is low on toner and waybills are coming out faint.",
    status: "open",
    requester: { staff_no: "BO010", name: "Modupe Johnson" },
    created_at: minutesAgo(40),
  },
];

let nextId = 3;

export async function listSupportRequests(query: SupportRequestQuery = {}): Promise<SupportRequestPage> {
  const page = query.page ?? 1;
  const perPage = query.per_page ?? 20;
  const matching = requests.filter((request) => !query.status || request.status === query.status);

  return {
    data: matching.slice((page - 1) * perPage, page * perPage),
    meta: { page, per_page: perPage, total: matching.length },
  };
}

export async function createSupportRequest(user: User, input: SupportRequestInput): Promise<SupportRequest> {
  const subject = input.subject.trim();
  const body = input.body.trim();
  const errors: Record<string, string[]> = {};
  if (!subject) errors.subject = ["Subject is required."];
  else if (subject.length > 120) errors.subject = ["Subject must be at most 120 characters."];
  if (!body) errors.body = ["Body is required."];
  else if (body.length > 2000) errors.body = ["Body must be at most 2000 characters."];
  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }

  const request: SupportRequest = {
    id: nextId++,
    subject,
    body,
    status: "open",
    requester: { staff_no: user.staff_no, name: user.name },
    created_at: nowTimestamp(),
  };
  requests.unshift(request);
  // Demo notifications go to a role, so an admin's own request would notify them too.
  if (user.role !== "admin") {
    notifyRole("admin", "support_request", `${user.name} asked for help: ${subject}`);
  }

  return request;
}

export async function updateSupportRequest(id: number, status: SupportStatus): Promise<SupportRequest> {
  const request = requests.find((current) => current.id === id);
  if (!request) {
    throw new ApiError(404, "Support request not found.");
  }
  request.status = status;
  return request;
}
