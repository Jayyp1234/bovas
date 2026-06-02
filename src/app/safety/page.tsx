import { redirect } from "next/navigation";

export default function SafetyIndexPage() {
  redirect("/safety/tickets");
}
