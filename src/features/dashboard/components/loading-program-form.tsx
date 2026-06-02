"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketPreviewPanel, type TicketPreviewData } from "./ticket-preview-panel";

interface Destination {
  station: string;
  quantity: string;
  address: string;
}

const terminalOptions = ["Terminal 1", "Terminal 2", "Terminal 3"];
const truckTypeOptions = ["Marketer", "Internal"];
const productOptions = ["PMS", "Diesel", "AGO"];

export function LoadingProgramForm() {
  const [ticketId, setTicketId] = useState("00234567");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("14:10");
  const [terminal, setTerminal] = useState(terminalOptions[0]);
  const [truckType, setTruckType] = useState(truckTypeOptions[0]);
  const [truckNumber, setTruckNumber] = useState("BDJ580XB");
  const [requestedAmount, setRequestedAmount] = useState("33,000 Litres");
  const [product, setProduct] = useState(productOptions[0]);
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      station: "Babatunde Ishola Filling Station",
      quantity: "33,000 Litres",
      address: "51, Apapa-Oshodi Expressway, Ijeshatedo, Lagos",
    },
  ]);
  const [marketer, setMarketer] = useState("Ardova PLC");
  const [representative, setRepresentative] = useState(
    "Elizabeth Fadenipo",
  );
  const [phoneNumber, setPhoneNumber] = useState("08104205202");

  function handleAddDestination() {
    setDestinations((current) => [
      ...current,
      { station: "", quantity: "", address: "" },
    ]);
  }

  function handleRemoveDestination(index: number) {
    setDestinations((current) => current.filter((_, i) => i !== index));
  }

  function handleDestinationChange(
    index: number,
    field: keyof Destination,
    value: string,
  ) {
    setDestinations((current) =>
      current.map((destination, i) =>
        i === index ? { ...destination, [field]: value } : destination,
      ),
    );
  }

  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);

  const previewData: TicketPreviewData = {
    ticketId,
    date,
    time,
    depot: terminal,
    truckType,
    truckNumber,
    product,
    requestedAmount,
    destinations,
    marketer,
    representative,
    phoneNumber,
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPreview(true);
  }

  function handleCreateTicket() {
    router.push("/ticket-history");
  }

  function handleBackToEdit() {
    setIsPreview(false);
  }

  if (isPreview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TicketPreviewPanel
          ticket={previewData}
          onEdit={handleBackToEdit}
          onCreate={handleCreateTicket}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Loading Ticket
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Generate Loading Ticket
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit">Preview Ticket</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Basic Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ticket-id">Ticket ID</Label>
              <Input
                id="ticket-id"
                name="ticketId"
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="terminal">Terminal</Label>
              <select
                id="terminal"
                name="terminal"
                value={terminal}
                onChange={(event) => setTerminal(event.target.value)}
                className="flex h-14 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {terminalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Truck Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="truck-type">Truck Type</Label>
              <select
                id="truck-type"
                name="truckType"
                value={truckType}
                onChange={(event) => setTruckType(event.target.value)}
                className="flex h-14 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {truckTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="truck-number">Truck Number</Label>
              <Input
                id="truck-number"
                name="truckNumber"
                value={truckNumber}
                onChange={(event) => setTruckNumber(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requested-amount">Requested Loading Amount</Label>
              <Input
                id="requested-amount"
                name="requestedAmount"
                value={requestedAmount}
                onChange={(event) => setRequestedAmount(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="product">Product</Label>
              <select
                id="product"
                name="product"
                value={product}
                onChange={(event) => setProduct(event.target.value)}
                className="flex h-14 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {productOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Destination / Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-border bg-surface p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Destination {index + 1}
                    </p>
                  </div>
                  {destinations.length > 1 ? (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleRemoveDestination(index)}
                      className="h-10 px-3 text-sm"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`station-${index}`}>Station</Label>
                    <Input
                      id={`station-${index}`}
                      value={destination.station}
                      onChange={(event) =>
                        handleDestinationChange(
                          index,
                          "station",
                          event.target.value,
                        )
                      }
                      className="h-14 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Quantity to be Discharged</Label>
                    <Input
                      id={`quantity-${index}`}
                      value={destination.quantity}
                      onChange={(event) =>
                        handleDestinationChange(
                          index,
                          "quantity",
                          event.target.value,
                        )
                      }
                      className="h-14 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor={`address-${index}`}>Address</Label>
                  <Input
                    id={`address-${index}`}
                    value={destination.address}
                    onChange={(event) =>
                      handleDestinationChange(
                        index,
                        "address",
                        event.target.value,
                      )
                    }
                    className="h-14 rounded-xl"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={handleAddDestination}
            >
              <Plus className="size-4" />
              Add another destination
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Marketer / Industrial Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="marketer">Marketer</Label>
              <Input
                id="marketer"
                value={marketer}
                onChange={(event) => setMarketer(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representative">Representative</Label>
              <Input
                id="representative"
                value={representative}
                onChange={(event) => setRepresentative(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="h-14 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
