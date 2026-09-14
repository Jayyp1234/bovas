import { expect, test } from "@playwright/test";
import { HOME, ROLES, signIn } from "./support";

/** Pages that belong to one workspace, beyond its home. */
const OWN_PAGES = {
  admin: ["/admin/staff", "/admin/settings"],
  logistics: ["/ticket-history", "/settings"],
  safety: ["/safety/history"],
  dispatch: ["/dispatch/gate", "/dispatch/settings"],
} as const;

/** Each workspace's CSV export, which starts a download rather than opening a page. */
const DOWNLOADS = {
  admin: "/download/audit-log",
  logistics: "/download/ticket-history",
  safety: "/download/inspection-history",
  dispatch: null,
} as const;

test("signed-out visitors are sent to sign in, keeping the page they wanted", async ({ page }) => {
  for (const home of Object.values(HOME)) {
    await page.goto(home);
    await expect(page).toHaveURL(`/?next=${encodeURIComponent(home)}`);
  }
});

for (const role of ROLES) {
  test(`${role} can open its own workspace and no other`, async ({ page }) => {
    await signIn(page, role);

    for (const other of ROLES) {
      for (const path of [HOME[other], ...OWN_PAGES[other]]) {
        await page.goto(path);
        if (other === role) {
          await expect(page, `${role} opening ${path}`).toHaveURL(new RegExp(`${path}$`));
        } else {
          await expect(page, `${role} opening ${path}`).toHaveURL(/\/no-access$/);
          await expect(page.getByRole("heading", { name: "You don't have access to that page" })).toBeVisible();
        }
      }

      const download = DOWNLOADS[other];
      if (download) {
        // Same session cookies as the page, without the browser treating the CSV as a download.
        const response = await page.request.get(download);
        if (other === role) {
          expect(response.headers()["content-type"], `${role} downloading ${download}`).toContain("text/csv");
        } else {
          expect(new URL(response.url()).pathname, `${role} downloading ${download}`).toBe("/no-access");
        }
      }
    }
  });
}
