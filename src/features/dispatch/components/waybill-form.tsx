"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLitres } from "@/lib/format";
import {
  isOverloaded,
  loadVariance,
  type DispatchQueueItem,
  type PartyKind,
} from "../data/waybills";
import {
  WaybillPreviewPanel,
  type WaybillPreviewData,
} from "./waybill-preview-panel";

interface WaybillFormProps {
  ticket: DispatchQueueItem;
}

const AKOBO_ADDRESS =
  "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.";

function partyKindFor(truckType: DispatchQueueItem["truckType"]): PartyKind {
  if (truckType === "Marketer") return "marketer";
  if (truckType === "Industrial") return "industrial";
  return "internal";
}

const PARTY_TITLE: Record<PartyKind, string> = {
  marketer: "Marketer Info",
  industrial: "Industrial Info",
  internal: "",
};

const readonlyInput = "bg-muted/50 text-muted-foreground";
const fieldClass = "h-12 rounded-xl";

interface Destination {
  station: string;
  quantityDischarged: string;
  address: string;
}

export function WaybillForm({ ticket }: WaybillFormProps) {
  const router = useRouter();
  const partyKind = partyKindFor(ticket.truckType);

  const [step, setStep] = useState<1 | 2>(1);
  const [isPreview, setIsPreview] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [approvalRequested, setApprovalRequested] = useState(false);

  const quarter = Math.round(ticket.quantityRequested / 4 / 500) * 500;

  const [waybillId] = useState("A1234567");
  const [compartments, setCompartments] = useState<string[]>([
    String(quarter),
    String(quarter),
    String(ticket.quantityRequested - quarter * 2),
  ]);
  const [loader, setLoader] = useState("Ayomide Olamide");

  const [destinations, setDestinations] = useState<Destination[]>([
    {
      station: "BOVAS Filling Station, Akobo 4",
      quantityDischarged: String(Math.round(ticket.quantityRequested * 0.55)),
      address: AKOBO_ADDRESS,
    },
  ]);
  const [company, setCompany] = useState(
    partyKind === "internal" ? "" : "Feasible Path LTD",
  );
  const [representative, setRepresentative] = useState(
    partyKind === "internal" ? "" : "Opeyemi Fadenipo",
  );
  const [partyPhone, setPartyPhone] = useState(
    partyKind === "internal" ? "" : "08104205202",
  );
  const [driverName, setDriverName] = useState("Elizabeth Fadenipo");
  const [driverPhone, setDriverPhone] = useState("08104205202");

  const loadedQuantity = useMemo(
    () =>
      compartments.reduce((sum, value) => sum + (Number(value) || 0), 0),
    [compartments],
  );
  const variance = loadVariance(ticket.quantityRequested, loadedQuantity);
  const overloaded = isOverloaded(ticket.quantityRequested, loadedQuantity);

  function updateCompartment(index: number, value: string) {
    setCompartments((current) =>
      current.map((item, i) => (i === index ? value : item)),
    );
  }

  function addCompartment() {
    setCompartments((current) => [...current, "0"]);
  }

  function removeCompartment(index: number) {
    setCompartments((current) => current.filter((_, i) => i !== index));
  }

  function updateDestination(
    index: number,
    field: keyof Destination,
    value: string,
  ) {
    setDestinations((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addDestination() {
    setDestinations((current) => [
      ...current,
      { station: "", quantityDischarged: "", address: "" },
    ]);
  }

  function removeDestination(index: number) {
    setDestinations((current) => current.filter((_, i) => i !== index));
  }

  function handleGenerate() {
    if (overloaded) {
      setBlocked(true);
      return;
    }
    setIsPreview(true);
  }

  const previewData: WaybillPreviewData = {
    waybillId,
    loadingTicketId: ticket.loadingTicketId,
    date: "Monday, 21st April, 2026",
    time: "14:10",
    depot: "Terminal 1",
    truckType: ticket.truckType,
    truckNumber: ticket.truckNumber,
    product: ticket.product,
    requestedQuantity: ticket.quantityRequested,
    loadedQuantity,
    compartments: compartments.map((value, index) => ({
      label: `Compartment ${index + 1}`,
      litres: Number(value) || 0,
    })),
    loader,
    destinations: destinations.map((destination) => ({
      station: destination.station,
      address: destination.address,
      quantityDischarged: Number(destination.quantityDischarged) || 0,
    })),
    partyKind,
    party:
      partyKind === "internal"
        ? undefined
        : { company, representative, phone: partyPhone },
    driver: { name: driverName, phone: driverPhone },
  };

  if (isPreview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WaybillPreviewPanel
          waybill={previewData}
          onEdit={() => setIsPreview(false)}
          onCancel={() => router.push("/dispatch/queue")}
          onDownload={() => router.push("/dispatch/waybill-history")}
          onPrint={() => router.push("/dispatch/waybill-history")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Waybill
        </h1>
        <span className="text-sm text-muted-foreground">Step {step} of 2</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loading-ticket-id">Loading Ticket ID</Label>
                <Input
                  id="loading-ticket-id"
                  value={ticket.loadingTicketId}
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waybill-id">Waybill ID</Label>
                <Input
                  id="waybill-id"
                  value={waybillId}
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value="Monday, 21st April, 2026"
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value="14:10"
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="terminal">Terminal</Label>
                <Input
                  id="terminal"
                  value="Terminal 1"
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Truck Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="truck-type">Truck Type</Label>
                <Input
                  id="truck-type"
                  value={ticket.truckType}
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="truck-number">Truck Number</Label>
                <Input
                  id="truck-number"
                  value={ticket.truckNumber}
                  readOnly
                  className={`${fieldClass} ${readonlyInput}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    value={ticket.product}
                    readOnly
                    className={`${fieldClass} ${readonlyInput}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requested">Requested Quantity</Label>
                  <Input
                    id="requested"
                    value={formatLitres(ticket.quantityRequested)}
                    readOnly
                    className={`${fieldClass} ${readonlyInput}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loaded">Loaded Quantity</Label>
                  <Input
                    id="loaded"
                    value={formatLitres(loadedQuantity)}
                    readOnly
                    className={`${fieldClass} ${
                      overloaded
                        ? "border-danger/50 bg-danger-surface/40 text-danger"
                        : readonlyInput
                    }`}
                  />
                </div>
              </div>

              {overloaded && (
                <p className="text-xs font-medium text-danger">
                  Loaded quantity exceeds the requested amount by{" "}
                  {formatLitres(variance)}. Admin approval will be required to
                  generate this waybill.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                {compartments.map((value, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`compartment-${index}`}>
                        Quantity in Compartment {index + 1}
                      </Label>
                      {compartments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompartment(index)}
                          aria-label={`Remove compartment ${index + 1}`}
                          className="text-muted-foreground transition-colors hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <Input
                      id={`compartment-${index}`}
                      type="number"
                      inputMode="numeric"
                      value={value}
                      onChange={(event) =>
                        updateCompartment(index, event.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCompartment}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
              >
                <Plus className="size-4" />
                Add another compartment
              </button>

              <div className="space-y-2">
                <Label htmlFor="loader">Loader</Label>
                <Input
                  id="loader"
                  value={loader}
                  onChange={(event) => setLoader(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/dispatch/queue")}
            >
              Cancel
            </Button>
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Destination / Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {destinations.map((destination, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-foreground">
                      Destination {index + 1}
                    </p>
                    {destinations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        aria-label={`Remove destination ${index + 1}`}
                        className="text-muted-foreground transition-colors hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`station-${index}`}>Station</Label>
                      <Input
                        id={`station-${index}`}
                        value={destination.station}
                        onChange={(event) =>
                          updateDestination(index, "station", event.target.value)
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`discharge-${index}`}>
                        Quantity to be Discharged
                      </Label>
                      <Input
                        id={`discharge-${index}`}
                        value={destination.quantityDischarged}
                        onChange={(event) =>
                          updateDestination(
                            index,
                            "quantityDischarged",
                            event.target.value,
                          )
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`address-${index}`}>Address</Label>
                    <Input
                      id={`address-${index}`}
                      value={destination.address}
                      onChange={(event) =>
                        updateDestination(index, "address", event.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDestination}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
              >
                <Plus className="size-4" />
                Add another destination
              </button>
            </CardContent>
          </Card>

          {partyKind !== "internal" && (
            <Card>
              <CardHeader>
                <CardTitle>{PARTY_TITLE[partyKind]}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representative">Representative</Label>
                  <Input
                    id="representative"
                    value={representative}
                    onChange={(event) => setRepresentative(event.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party-phone">Phone Number</Label>
                  <Input
                    id="party-phone"
                    value={partyPhone}
                    onChange={(event) => setPartyPhone(event.target.value)}
                    className={fieldClass}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Driver&apos;s Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="driver-name">Driver&apos;s Name</Label>
                <Input
                  id="driver-name"
                  value={driverName}
                  onChange={(event) => setDriverName(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-phone">Phone Number</Label>
                <Input
                  id="driver-phone"
                  value={driverPhone}
                  onChange={(event) => setDriverPhone(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Previous
            </Button>
            <Button onClick={handleGenerate}>Generate Waybill</Button>
          </div>
        </div>
      )}

      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger-surface">
              <Ban className="size-6 text-danger" />
            </div>
            <h2 className="text-center text-base font-bold text-foreground">
              Waybill Generation Blocked
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              System protocol prevents waybill generation for overloaded
              vehicles. Please request an Admin Override to proceed.
            </p>

            <dl className="mt-4 space-y-2 rounded-xl border border-border p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Truck Number</dt>
                <dd className="font-semibold text-foreground">
                  {ticket.truckNumber}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Loading Ticket ID</dt>
                <dd className="font-semibold text-foreground">
                  {ticket.loadingTicketId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Requested Amount</dt>
                <dd className="font-semibold text-foreground">
                  {formatLitres(ticket.quantityRequested)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Amount Loaded</dt>
                <dd className="font-semibold text-foreground">
                  {formatLitres(loadedQuantity)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Variance</dt>
                <dd className="font-semibold text-danger">
                  +{formatLitres(variance)}
                </dd>
              </div>
            </dl>

            {approvalRequested ? (
              <p className="mt-5 rounded-lg bg-success-surface px-3 py-2 text-center text-sm font-medium text-success">
                Admin approval requested. You&apos;ll be notified once it&apos;s
                reviewed.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setApprovalRequested(true)}
                className="mt-5 w-full rounded-lg bg-foreground py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
              >
                Request Admin Approval
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setBlocked(false);
                setApprovalRequested(false);
              }}
              className="mt-2 w-full py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
