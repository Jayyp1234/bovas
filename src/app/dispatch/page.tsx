import { redirect } from "next/navigation";

/** Dispatch starts at the first queue. */
export default function DispatchPage() {
  redirect("/dispatch/loading");
}
