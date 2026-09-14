import { expect, test } from "@playwright/test";
import { sessionFor } from "./support";

/** The truck the demo loading program has no ticket for yet (bovas-api DemoDaySeeder). */
const TRUCK = "LSR118AA";

test("a truck goes from the loading program to through the gate", async ({ browser }) => {
  // Logistics starts a ticket from the loading program.
  const logistics = await sessionFor(browser, "logistics");
  await logistics.goto("/loading-program");
  await logistics.getByRole("row", { name: new RegExp(TRUCK) }).getByRole("link", { name: "Start Ticket" }).click();
  await expect(logistics.getByRole("heading", { name: "Generate Loading Ticket" })).toBeVisible();
  await expect(logistics.getByLabel("Truck Number")).toHaveValue(TRUCK);
  // The loading program names each station but not its address, so Logistics adds it.
  await logistics.getByLabel("Address").fill("3 Epe-Lekki Road, Epe, Lagos");

  await logistics.getByRole("button", { name: "Preview Ticket" }).click();
  await logistics.getByRole("button", { name: "Create Ticket" }).click();
  // Creating redirects to the new ticket with ?saved=created for its confirmation.
  await expect(logistics).toHaveURL(/\/ticket-history\/\d{8}(\?|$)/);
  const ticketNo = new URL(logistics.url()).pathname.split("/").at(-1)!;

  // Safety ticks the whole checklist and approves the truck.
  const safety = await sessionFor(browser, "safety");
  await safety.goto("/safety/tickets");
  await safety.getByRole("button", { name: new RegExp(`Ticket #${ticketNo}`) }).click();
  for (const item of await safety.getByRole("switch").all()) {
    await item.click();
    await expect(item).toHaveAttribute("aria-checked", "true");
  }
  await safety.getByRole("radiogroup", { name: "Spare Tyre" }).getByRole("radio", { name: "1" }).click();
  await safety.getByRole("button", { name: "Approve Ticket" }).click();
  await expect(safety.getByText(`Ticket #${ticketNo} (${TRUCK}) is approved for loading.`)).toBeVisible();

  // Logistics hears about it.
  await logistics.reload();
  await expect(logistics.getByRole("button", { name: /Notifications, \d+ unread/ })).toBeVisible();

  // Dispatch records the load, issues the waybill and clears the gate.
  const dispatch = await sessionFor(browser, "dispatch");
  const truckButton = dispatch.getByRole("button", { name: new RegExp(`Ticket #${ticketNo}`) });

  await dispatch.goto("/dispatch/loading");
  await truckButton.click();
  await dispatch.getByLabel("Litres Loaded").fill("45000");
  await expect(dispatch.getByText(/^Within limit/)).toBeVisible();
  await dispatch.getByRole("button", { name: "Record Loading" }).click();
  await expect(dispatch.getByRole("status")).toBeVisible();
  await expect(truckButton).toHaveCount(0);

  await dispatch.goto("/dispatch/waybills");
  await truckButton.click();
  await dispatch.getByRole("button", { name: "Issue Waybill" }).click();
  const printLink = dispatch.getByRole("link", { name: /Print Waybill A\d{7}/ });
  await expect(printLink).toBeVisible();
  const waybillNo = (await printLink.textContent())!.match(/A\d{7}/)![0];

  await dispatch.goto("/dispatch/gate");
  await truckButton.click();
  await dispatch.getByRole("button", { name: "Clear Gate" }).click();
  await expect(dispatch.getByRole("status")).toBeVisible();
  await expect(truckButton).toHaveCount(0);

  // The ticket is closed everywhere: Logistics sees it through the gate, and the admin's audit
  // trail has every step.
  await logistics.goto(`/ticket-history/${ticketNo}`);
  await expect(logistics.getByText("Gate Cleared").first()).toBeVisible();
  await expect(logistics.getByText(waybillNo).first()).toBeVisible();

  const admin = await sessionFor(browser, "admin");
  await admin.goto(`/admin/audit/${ticketNo}`);
  await expect(admin.getByText(waybillNo).first()).toBeVisible();
  await expect(admin.getByText(/Gate Cleared/).first()).toBeVisible();
});
