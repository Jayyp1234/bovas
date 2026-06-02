import type { LoadingTicket } from "../types";

export interface TicketDestination {
  station: string;
  amount: string;
  address: string;
}

export interface MarketerInfo {
  marketer: string;
  representative: string;
  phone: string;
}

export interface TicketDetail extends LoadingTicket {
  terminal: string;
  requestedAmount: string;
  destinations: TicketDestination[];
  marketerInfo: MarketerInfo;
}

/** Mock "Today's Loading Tickets" — stand-in until the API is wired up. */
export const loadingTickets: LoadingTicket[] = [
  {
    id: "24989001",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 3, 45,000 Litres",
    status: "approved",
  },
  {
    id: "24989002",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 33000,
    destination: "Babatunde Ishola Filling Station",
    status: "rejected",
  },
  {
    id: "24989003",
    customer: "Connoil",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 4, 45,000 Litres",
    status: "pending",
  },
  {
    id: "24989004",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Local",
    status: "approved",
  },
  {
    id: "24989005",
    customer: "MRS",
    truckType: "Industrial",
    truckNumber: "T245-YA",
    product: "PMS",
    quantity: 30000,
    destination: "Babatunde Ishola Filling Station",
    status: "pending",
  },
  {
    id: "24989006",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 4, 45,000 Litres",
    status: "approved",
  },
  {
    id: "24989007",
    customer: "Hill Crest",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Babatunde Ishola Filling Station",
    status: "approved",
  },
  {
    id: "24989008",
    customer: "Feasible Path",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Babatunde Ishola Filling Station",
    status: "approved",
  },
  {
    id: "24989009",
    customer: "Jots M",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Babatunde Ishola Filling Station",
    status: "approved",
  },
  {
    id: "24989010",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: 45000,
    destination: "Babatunde Ishola Filling Station",
    status: "rejected",
  },
];

export const ticketDetails: TicketDetail[] = [
  {
    id: "24989001",
    customer: "BOVAS",
    terminal: "Terminal 1",
    status: "approved",
    truckType: "Internal",
    truckNumber: "BDJ580XB",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 4, 45,000 Litres",
    requestedAmount: "45,000 Litres",
    destinations: [
      {
        station: "BOVAS Filling Station, Akobo 4",
        amount: "45,000 Litres",
        address:
          "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
      },
    ],
    marketerInfo: {
      marketer: "Feasible Path LTD",
      representative: "Opeyemi Fadenipo",
      phone: "08104205202",
    },
  },
  {
    id: "24989002",
    customer: "Fatgbems",
    terminal: "Terminal 1",
    status: "rejected",
    truckType: "Industrial",
    truckNumber: "BDJ580XB",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 4, 45,000 Litres",
    requestedAmount: "45,000 Litres",
    destinations: [
      {
        station: "BOVAS Filling Station, Akobo 4",
        amount: "45,000 Litres",
        address:
          "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
      },
    ],
    marketerInfo: {
      marketer: "Feasible Path LTD",
      representative: "Opeyemi Fadenipo",
      phone: "08104205202",
    },
  },
  {
    id: "24989003",
    customer: "Connoil",
    terminal: "Terminal 1",
    status: "pending",
    truckType: "Internal",
    truckNumber: "BDJ580XB",
    product: "PMS",
    quantity: 45000,
    destination: "Akobo 4, 45,000 Litres",
    requestedAmount: "45,000 Litres",
    destinations: [
      {
        station: "BOVAS Filling Station, Akobo 4",
        amount: "30,000 Litres",
        address:
          "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
      },
      {
        station: "BOVAS Filling Station, Akobo 3",
        amount: "15,000 Litres",
        address:
          "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
      },
    ],
    marketerInfo: {
      marketer: "Feasible Path LTD",
      representative: "Opeyemi Fadenipo",
      phone: "08104205202",
    },
  },
];

export function getTicketDetailById(id: string) {
  return ticketDetails.find((ticket) => ticket.id === id);
}
