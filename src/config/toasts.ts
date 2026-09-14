/**
 * Confirmations a server action can hand to the next page as `?toast=<key>`. Only these keys
 * are shown, so nobody can put their own text on screen through a link.
 */
export const TOAST_MESSAGES = {
  "staff-created": "Staff profile created. The temporary password was emailed.",
  "staff-updated": "Staff profile saved.",
  "staff-deleted": "Staff profile deleted.",
} as const;

export type ToastKey = keyof typeof TOAST_MESSAGES;
