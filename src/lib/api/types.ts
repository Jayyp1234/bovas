/**
 * Named aliases for the API contract. Every shape comes from bovas-api/openapi.yaml
 * through `npm run api:types`, so components never hand-write a response type.
 * Type-only, so client components can import it too.
 */
import type { components, operations } from "./schema";

type Schemas = components["schemas"];
type QueryOf<Operation extends keyof operations> = NonNullable<
  operations[Operation]["parameters"]["query"]
>;

// Enums
export type Role = Schemas["Role"];
export type TruckType = Schemas["TruckType"];
export type Product = Schemas["Product"];
export type TicketStatus = Schemas["TicketStatus"];
export type TicketStatusGroup = Schemas["TicketStatusGroup"];
export type AuditStatus = Schemas["AuditStatus"];
export type InspectionResult = Schemas["InspectionResult"];
export type RejectionReason = Schemas["RejectionReason"];
export type LoadingOutcome = Schemas["LoadingOutcome"];
export type TimelineEventType = Schemas["TimelineEventType"];
export type Period = Schemas["Period"];
export type DispatchStage = Schemas["DispatchStage"];
export type OverloadDecision = Schemas["OverloadDecision"];
export type NotificationType = Schemas["NotificationType"];
export type SupportStatus = Schemas["SupportStatus"];

// Auth
export type Message = Schemas["Message"];
export type LoginRequest = Schemas["LoginRequest"];
export type LoginResponse = Schemas["LoginResponse"];
export type ResetPasswordRequest = Schemas["ResetPasswordRequest"];

// Records
export type PaginationMeta = Schemas["PaginationMeta"];
export type Terminal = Schemas["Terminal"];
export type TerminalRef = Schemas["TerminalRef"];
export type StaffRef = Schemas["StaffRef"];
export type CustomerRef = Schemas["CustomerRef"];
export type Customer = Schemas["Customer"];
export type TruckRef = Schemas["TruckRef"];
export type Driver = Schemas["Driver"];
export type Destination = Schemas["Destination"];
export type MarketerContact = Schemas["MarketerContact"];
export type User = Schemas["User"];
export type NextStaffNo = Schemas["NextStaffNo"];
export type ProgramItem = Schemas["ProgramItem"];
export type Ticket = Schemas["Ticket"];
export type TicketDetail = Schemas["TicketDetail"];
export type InspectionOutcome = Schemas["InspectionOutcome"];
export type QueueTicket = Schemas["QueueTicket"];
export type ChecklistItem = Schemas["ChecklistItem"];
export type Inspection = Schemas["Inspection"];
export type InspectionSummary = Schemas["InspectionSummary"];
export type DashboardStats = Schemas["DashboardStats"];
export type DashboardCharts = Schemas["DashboardCharts"];
export type ChartPoint = Schemas["ChartPoint"];
export type AuditEntry = Schemas["AuditEntry"];
export type AuditDetail = Schemas["AuditDetail"];
export type TimelineEntry = Schemas["TimelineEntry"];
export type StaffOnDuty = Schemas["StaffOnDuty"];
export type ActivityReportRow = Schemas["ActivityReportRow"];
export type ActivityTotals = Schemas["ActivityTotals"];
export type LoadingRecord = Schemas["LoadingRecord"];
export type LoadingSummary = Schemas["LoadingSummary"];
export type WaybillRef = Schemas["WaybillRef"];
export type Waybill = Schemas["Waybill"];
export type GateClearance = Schemas["GateClearance"];
export type DispatchQueueItem = Schemas["DispatchQueueItem"];
/** Named to avoid the browser's own `Notification`. */
export type AppNotification = Schemas["Notification"];
export type SupportRequest = Schemas["SupportRequest"];
export type Settings = Schemas["Settings"];

// Requests
export type TicketInput = Schemas["TicketInput"];
export type TicketPatch = Schemas["TicketPatch"];
export type InspectionInput = Schemas["InspectionInput"];
export type LoadingRecordInput = Schemas["LoadingRecordInput"];
export type OverloadDecisionInput = Schemas["OverloadDecisionInput"];
export type StaffInput = Schemas["StaffInput"];
export type StaffPatch = Schemas["StaffPatch"];
export type CustomerInput = Schemas["CustomerInput"];
export type CustomerPatch = Schemas["CustomerPatch"];
export type UpdateMeRequest = Schemas["UpdateMeRequest"];
export type ChangePasswordRequest = Schemas["ChangePasswordRequest"];
export type SupportRequestInput = Schemas["SupportRequestInput"];
export type SettingsPatch = Schemas["SettingsPatch"];
export type TerminalInput = Schemas["TerminalInput"];

// Responses
export type TerminalList = Schemas["TerminalList"];
export type DispatchQueueList = Schemas["DispatchQueueList"];
export type LoadingProgram = Schemas["LoadingProgram"];
export type ProgramPreview = Schemas["ProgramPreview"];
export type ProgramImportError = Schemas["ProgramImportError"];
export type ProgramItemPage = Schemas["ProgramItemPage"];
export type TicketPage = Schemas["TicketPage"];
export type QueueTicketList = Schemas["QueueTicketList"];
export type ChecklistItemList = Schemas["ChecklistItemList"];
export type InspectionPage = Schemas["InspectionPage"];
export type AuditEntryPage = Schemas["AuditEntryPage"];
export type ActivityReportPage = Schemas["ActivityReportPage"];
export type StaffPage = Schemas["StaffPage"];
export type CustomerPage = Schemas["CustomerPage"];
export type NotificationList = Schemas["NotificationList"];
export type SupportRequestPage = Schemas["SupportRequestPage"];

// Query parameters
export type ProgramItemQuery = QueryOf<"listProgramItems">;
export type TicketQuery = QueryOf<"listTickets">;
export type SafetyQueueQuery = QueryOf<"getSafetyQueue">;
export type InspectionQuery = QueryOf<"listInspections">;
export type AuditQuery = QueryOf<"listAuditEntries">;
export type ActivityReportQuery = QueryOf<"getActivityReport">;
export type ActivityReportCsvQuery = QueryOf<"exportActivityReport">;
export type StaffQuery = QueryOf<"listStaff">;
export type CustomerQuery = QueryOf<"listCustomers">;
export type DashboardChartsQuery = QueryOf<"getDashboardCharts">;
export type NotificationQuery = QueryOf<"listNotifications">;
export type SupportRequestQuery = QueryOf<"listSupportRequests">;
