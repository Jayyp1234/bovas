import { CircleCheckBig, FileText, TriangleAlert, type LucideIcon } from "lucide-react";

export type TruckType = "Internal" | "Marketer" | "Industrial";

/** Whether the counterparty section prints as marketer, industrial, or is omitted. */
export type PartyKind = "marketer" | "industrial" | "internal";

export type WaybillStatus = "issued" | "printed" | "flagged";

/** An approved loading ticket waiting to be turned into a waybill. */
export interface DispatchQueueItem {
  loadingTicketId: string;
  customer: string;
  truckType: TruckType;
  truckNumber: string;
  product: string;
  quantityRequested: number;
  destination: string;
}

export interface Compartment {
  /** e.g. "Compartment 1" */
  label: string;
  litres: number;
}

export interface WaybillDestination {
  station: string;
  address: string;
  quantityDischarged: number;
}

/** Marketer's or industrial company's contact block. */
export interface PartyInfo {
  company: string;
  representative: string;
  phone: string;
}

export interface DriverInfo {
  name: string;
  phone: string;
}

export interface Waybill {
  /** Waybill ID, e.g. "A1234567". */
  id: string;
  loadingTicketId: string;
  customer: string;
  date: string;
  time: string;
  depot: string;
  truckType: TruckType;
  truckNumber: string;
  product: string;
  requestedQuantity: number;
  loadedQuantity: number;
  compartments: Compartment[];
  loader: string;
  destinations: WaybillDestination[];
  partyKind: PartyKind;
  /** Present for marketer/industrial waybills; omitted for internal trucks. */
  party?: PartyInfo;
  driver: DriverInfo;
  status: WaybillStatus;
}

export interface DispatchStat {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
}

/** Top-of-dashboard operations stats for the Dispatch role. */
export const dispatchStats: DispatchStat[] = [
  {
    label: "Approved Loading Ticket",
    value: 134,
    hint: "Last generated 14:06",
    icon: CircleCheckBig,
  },
  {
    label: "Waybills Issued",
    value: 85,
    hint: "Last generated 14:06",
    icon: FileText,
  },
  { label: "Overloaded Trucks", value: 1, icon: TriangleAlert },
];

/** A single bar in the per-marketer charts. */
export interface MarketerDatum {
  marketer: string;
  value: number;
}

export const trucksPerMarketer: MarketerDatum[] = [
  { marketer: "BOVAS", value: 70 },
  { marketer: "FATGBEMS", value: 48 },
  { marketer: "TEPATH", value: 55 },
  { marketer: "B/TUNDE", value: 42 },
  { marketer: "JOJO M", value: 50 },
  { marketer: "JOTS M", value: 12 },
  { marketer: "TECHNO", value: 18 },
  { marketer: "HCREST", value: 30 },
];

export const quantityLoadedPerMarketer: MarketerDatum[] = [
  { marketer: "BOVAS", value: 72 },
  { marketer: "FATGBEMS", value: 47 },
  { marketer: "TEPATH", value: 40 },
  { marketer: "B/TUNDE", value: 44 },
  { marketer: "JOJO M", value: 51 },
  { marketer: "JOTS M", value: 13 },
  { marketer: "TECHNO", value: 19 },
  { marketer: "HCREST", value: 31 },
];

const AKOBO_ADDRESS =
  "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.";

/** Approved loading tickets awaiting waybill generation (the Dispatch Queue). */
export const dispatchQueue: DispatchQueueItem[] = [
  {
    loadingTicketId: "21040701",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 45000,
    destination: "Akobo 1, 30,000 Litres",
  },
  {
    loadingTicketId: "21040702",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 33000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040703",
    customer: "Connoil",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 60000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040704",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 45000,
    destination: "Local",
  },
  {
    loadingTicketId: "21040705",
    customer: "MRS",
    truckType: "Industrial",
    truckNumber: "T2345-LA",
    product: "PMS",
    quantityRequested: 60000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040706",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 33000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040707",
    customer: "Hill Crest",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 45000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040708",
    customer: "Feasible Path",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 50000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040709",
    customer: "Jots M",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 45000,
    destination: "Babatunde Ishola Filling Station",
  },
  {
    loadingTicketId: "21040710",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantityRequested: 45000,
    destination: "Babatunde Ishola Filling Station",
  },
];

interface WaybillSeed {
  id: string;
  loadingTicketId: string;
  customer: string;
  truckNumber: string;
  truckType: TruckType;
  partyKind: PartyKind;
  requested: number;
  loaded: number;
  status: WaybillStatus;
  party?: PartyInfo;
}

function buildWaybill(seed: WaybillSeed): Waybill {
  const quarter = Math.round(seed.loaded / 4 / 500) * 500;
  return {
    id: seed.id,
    loadingTicketId: seed.loadingTicketId,
    customer: seed.customer,
    date: "Monday, 21st April, 2026",
    time: "14:10",
    depot: "Terminal 1",
    truckType: seed.truckType,
    truckNumber: seed.truckNumber,
    product: "PMS",
    requestedQuantity: seed.requested,
    loadedQuantity: seed.loaded,
    compartments: [
      { label: "Compartment 1", litres: quarter },
      { label: "Compartment 2", litres: quarter },
      { label: "Compartment 3", litres: seed.loaded - quarter * 2 },
    ],
    loader: "Ayomide Olamide",
    destinations: [
      {
        station: "BOVAS Filling Station, Akobo 4",
        address: AKOBO_ADDRESS,
        quantityDischarged: Math.round(seed.loaded * 0.55),
      },
      {
        station: "BOVAS Filling Station, Akobo 2",
        address: AKOBO_ADDRESS,
        quantityDischarged: seed.loaded - Math.round(seed.loaded * 0.55),
      },
    ],
    partyKind: seed.partyKind,
    party: seed.party,
    driver: { name: "Olusegun Johnson", phone: "08104205202" },
    status: seed.status,
  };
}

const marketerParty: PartyInfo = {
  company: "Feasible Path LTD",
  representative: "Opeyemi Fadenipo",
  phone: "08104205202",
};

const industrialParty: PartyInfo = {
  company: "Fatgbems Petroleum",
  representative: "Idowu Olamilekan",
  phone: "08104205202",
};

const waybillSeeds: WaybillSeed[] = [
  { id: "A1234567", loadingTicketId: "210407001", customer: "BOVAS", truckNumber: "BDJ590XA", truckType: "Internal", partyKind: "internal", requested: 45000, loaded: 45000, status: "printed" },
  { id: "A1234568", loadingTicketId: "210407002", customer: "Fatgbems", truckNumber: "BDJ590XA", truckType: "Industrial", partyKind: "industrial", requested: 33000, loaded: 33500, status: "flagged", party: industrialParty },
  { id: "A1234569", loadingTicketId: "210407003", customer: "Connoil", truckNumber: "BDJ590XA", truckType: "Industrial", partyKind: "industrial", requested: 60000, loaded: 60000, status: "issued", party: industrialParty },
  { id: "A1234570", loadingTicketId: "210407004", customer: "BOVAS", truckNumber: "BDJ590XA", truckType: "Internal", partyKind: "internal", requested: 45000, loaded: 45000, status: "printed" },
  { id: "A1234571", loadingTicketId: "210407005", customer: "MRS", truckNumber: "T12345-LA", truckType: "Industrial", partyKind: "industrial", requested: 60000, loaded: 60000, status: "issued", party: industrialParty },
  { id: "A1234572", loadingTicketId: "210407006", customer: "Babatunde", truckNumber: "BDJ590XA", truckType: "Marketer", partyKind: "marketer", requested: 33000, loaded: 33000, status: "issued", party: marketerParty },
  { id: "A1234573", loadingTicketId: "210407007", customer: "Hill Crest", truckNumber: "BDJ590XA", truckType: "Marketer", partyKind: "marketer", requested: 45000, loaded: 45000, status: "printed", party: marketerParty },
  { id: "A1234574", loadingTicketId: "210407008", customer: "Feasible Path", truckNumber: "BDJ590XA", truckType: "Marketer", partyKind: "marketer", requested: 50000, loaded: 50000, status: "issued", party: marketerParty },
  { id: "A1234575", loadingTicketId: "210407009", customer: "Jots M", truckNumber: "BDJ590XA", truckType: "Marketer", partyKind: "marketer", requested: 45000, loaded: 45000, status: "printed", party: marketerParty },
  { id: "A1234576", loadingTicketId: "210407010", customer: "Fatgbems", truckNumber: "BDJ590XA", truckType: "Industrial", partyKind: "industrial", requested: 45000, loaded: 45000, status: "issued", party: industrialParty },
];

/** Waybills already issued — powers Waybill History, Today's Waybills and Reports. */
export const waybills: Waybill[] = waybillSeeds.map(buildWaybill);

/** Page-level aggregates shown on the Reports stat cards. */
export const dispatchReportTotals = {
  totalRequested: 1500340,
  totalLoaded: 1500840,
  variance: 500,
} as const;

export function getWaybillById(id: string): Waybill | undefined {
  return waybills.find((item) => item.id === id);
}

export function getQueueItemById(id: string): DispatchQueueItem | undefined {
  return dispatchQueue.find((item) => item.loadingTicketId === id);
}

/** A truck is overloaded when the amount loaded exceeds what was requested. */
export function loadVariance(requested: number, loaded: number): number {
  return loaded - requested;
}

export function isOverloaded(requested: number, loaded: number): boolean {
  return loadVariance(requested, loaded) > 0;
}
