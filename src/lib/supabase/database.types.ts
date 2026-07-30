export type AppRole = "logistics" | "admin" | "dispatch" | "safety";

export type TicketStatus = "approved" | "pending" | "rejected";
export type TruckType = "Internal" | "Marketer" | "Industrial";
export type ProductType = "PMS" | "AGO" | "DPK";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: AppRole;
          created_at?: string;
        };
        Relationships: [];
      };
      loading_tickets: {
        Row: {
          id: string;
          customer: string;
          truck_type: TruckType;
          truck_number: string;
          product: ProductType;
          quantity: number;
          destination: string;
          status: TicketStatus;
          terminal: string | null;
          requested_amount: string | null;
          marketer: string | null;
          representative: string | null;
          phone: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id: string;
          customer: string;
          truck_type: TruckType;
          truck_number: string;
          product: ProductType;
          quantity: number;
          destination: string;
          status?: TicketStatus;
          terminal?: string | null;
          requested_amount?: string | null;
          marketer?: string | null;
          representative?: string | null;
          phone?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          customer?: string;
          truck_type?: TruckType;
          truck_number?: string;
          product?: ProductType;
          quantity?: number;
          destination?: string;
          status?: TicketStatus;
          terminal?: string | null;
          requested_amount?: string | null;
          marketer?: string | null;
          representative?: string | null;
          phone?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      ticket_destinations: {
        Row: {
          id: string;
          ticket_id: string;
          station: string;
          amount: string;
          address: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          station: string;
          amount: string;
          address: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          station?: string;
          amount?: string;
          address?: string;
        };
        Relationships: [];
      };
      marketer_stats: {
        Row: {
          id: string;
          marketer: string;
          trucks: number;
          quantity_requested: number;
          recorded_on: string;
        };
        Insert: {
          id?: string;
          marketer: string;
          trucks?: number;
          quantity_requested?: number;
          recorded_on?: string;
        };
        Update: {
          id?: string;
          marketer?: string;
          trucks?: number;
          quantity_requested?: number;
          recorded_on?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      ticket_status: TicketStatus;
      truck_type: TruckType;
      product_type: ProductType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LoadingTicketRow =
  Database["public"]["Tables"]["loading_tickets"]["Row"];
export type MarketerStatsRow =
  Database["public"]["Tables"]["marketer_stats"]["Row"];
