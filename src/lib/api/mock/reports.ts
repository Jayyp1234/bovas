import { depotIsoDate, toCsv } from "@/lib/csv";
import type {
  ActivityReportCsvQuery,
  ActivityReportPage,
  ActivityReportQuery,
  ActivityReportRow,
  CustomerRef,
  TruckRef,
} from "../types";
import { CUSTOMERS, matchesSearch, nowTimestamp, paginate, truck } from "./shared";
import { tickets } from "./tickets";

function row(
  ticketNo: string,
  waybillNo: string,
  customer: CustomerRef,
  truckRef: TruckRef,
  requestedLitres: number,
  loadedLitres: number,
): ActivityReportRow {
  return {
    ticket_no: ticketNo,
    waybill_no: waybillNo,
    customer,
    truck: truckRef,
    product: "PMS",
    requested_litres: requestedLitres,
    loaded_litres: loadedLitres,
  };
}

/** Sample loaded trucks from the day before the ticket fixtures. */
const sampleRows: ActivityReportRow[] = [
  row("24988991", "A1234557", CUSTOMERS.bovas, truck("BDJ590XA", "internal"), 45000, 45000),
  row("24988992", "A1234558", CUSTOMERS.fatgbems, truck("BDJ590XA", "industrial"), 33000, 32900),
  row("24988993", "A1234559", CUSTOMERS.connoil, truck("BDJ590XA", "industrial"), 60000, 60000),
  row("24988994", "A1234560", CUSTOMERS.bovas, truck("BDJ590XA", "internal"), 45000, 45300),
  row("24988995", "A1234561", CUSTOMERS.mrs, truck("T12345-LA", "industrial"), 60000, 59850),
  row("24988996", "A1234562", CUSTOMERS.babatunde, truck("BDJ590XA", "marketer"), 33000, 33000),
  row("24988997", "A1234563", CUSTOMERS.hillCrest, truck("BDJ590XA", "marketer"), 45000, 45000),
  row("24988998", "A1234564", CUSTOMERS.feasiblePath, truck("BDJ590XA", "marketer"), 50000, 50100),
  row("24988999", "A1234565", CUSTOMERS.jotsM, truck("BDJ590XA", "marketer"), 45000, 44800),
  row("24989000", "A1234566", CUSTOMERS.fatgbems, truck("BDJ590XA", "industrial"), 45000, 45000),
];

/**
 * Trucks loaded in demo mode first, then the samples. `period` and `year` are ignored, and the
 * totals are added up from the rows, so they always agree with the table.
 */
function matchingRows(query: ActivityReportCsvQuery): ActivityReportRow[] {
  const loadedToday = tickets
    .filter((ticket) => ticket.loading !== null)
    .map((ticket) => ({
      ticket_no: ticket.ticket_no,
      waybill_no: ticket.waybill?.waybill_no ?? null,
      customer: ticket.customer,
      truck: ticket.truck,
      product: ticket.product,
      requested_litres: ticket.requested_litres,
      loaded_litres: ticket.loading?.actual_litres ?? null,
    }));

  return [...loadedToday.reverse(), ...sampleRows]
    .filter((item) => !query.truck_type || item.truck.type === query.truck_type)
    .filter((item) =>
      matchesSearch(query.q, item.ticket_no, item.waybill_no, item.customer.name, item.truck.plate),
    );
}

export async function getActivityReport(query: ActivityReportQuery = {}): Promise<ActivityReportPage> {
  const matches = matchingRows(query);
  const requested = matches.reduce((sum, item) => sum + item.requested_litres, 0);
  const loaded = matches.reduce((sum, item) => sum + (item.loaded_litres ?? 0), 0);
  const { data, meta } = paginate(matches, query.page, query.per_page);

  return {
    data,
    meta: {
      ...meta,
      totals: { requested_litres: requested, loaded_litres: loaded, variance_litres: loaded - requested },
      generated_at: nowTimestamp(),
    },
  };
}

/** The CSV the API would send, built from the same rows as the report. */
export async function exportActivityReport(
  query: ActivityReportCsvQuery,
): Promise<{ filename: string; csv: string }> {
  const matches = matchingRows(query);
  const requested = matches.reduce((sum, item) => sum + item.requested_litres, 0);
  const loaded = matches.reduce((sum, item) => sum + (item.loaded_litres ?? 0), 0);

  const lines: (string | number | null)[][] = [
    ["Loading Ticket ID", "Waybill ID", "Customer", "Truck Type", "Truck Number", "Product", "Requested Litres", "Loaded Litres", "Variance Litres"],
    ...matches.map((item) => [
      item.ticket_no,
      item.waybill_no,
      item.customer.name,
      item.truck.type,
      item.truck.plate,
      item.product,
      item.requested_litres,
      item.loaded_litres,
      (item.loaded_litres ?? 0) - item.requested_litres,
    ]),
    [""],
    ["Total", "", "", "", "", "", requested, loaded, loaded - requested],
  ];
  const scope = query.year ? String(query.year) : (query.period ?? "all-time");

  return { filename: `bovas-activity-report-${scope}-${depotIsoDate()}.csv`, csv: toCsv(lines) };
}
