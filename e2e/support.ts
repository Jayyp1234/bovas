import { expect, type Browser, type Page } from "@playwright/test";
import type { Role } from "@/lib/api/types";

/** bovas-api's seeded demo accounts, one per workspace. */
export const DEMO_EMAIL: Record<Role, string> = {
  admin: "olayinkafagboore@bovasgroups.com",
  logistics: "olatejuoyetoke@bovasgroups.com",
  safety: "abdullahaiyedun@bovasgroups.com",
  dispatch: "modupejohnson@bovasgroups.com",
};

/** Where each role lands after signing in. */
export const HOME: Record<Role, string> = {
  admin: "/admin/dashboard",
  logistics: "/dashboard",
  safety: "/safety/tickets",
  dispatch: "/dispatch/loading",
};

export const ROLES = Object.keys(HOME) as Role[];

/** Signs in through the sign-in form, as staff do. */
export async function signIn(page: Page, role: Role): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Work Email Address").fill(DEMO_EMAIL[role]);
  await page.getByLabel("Password", { exact: true }).fill(process.env.DEMO_PASSWORD ?? "Bovas@2026");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(new RegExp(`${HOME[role]}$`));
}

/** A separate browser session signed in as the role, like a second person at another desk. */
export async function sessionFor(browser: Browser, role: Role): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, role);
  return page;
}
