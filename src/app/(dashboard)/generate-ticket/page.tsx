import type { Metadata } from "next";
import { LoadingProgramForm } from "@/features/dashboard/components/loading-program-form";

export const metadata: Metadata = { title: "Generate Ticket" };

export default async function GenerateTicketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) =>
    typeof sp[key] === "string" ? (sp[key] as string) : undefined;

  return (
    <LoadingProgramForm
      initial={{
        truckType: get("truckType"),
        truckNumber: get("truckNumber"),
        product: get("product"),
        quantity: get("quantity"),
      }}
    />
  );
}
