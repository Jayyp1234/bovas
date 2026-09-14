/** What a server action hands back to its form after a submission. */
export interface FormState {
  /** A message for the whole form, e.g. "Email or password is incorrect." */
  message?: string;
  /** Messages for individual fields, keyed by field name. */
  fieldErrors?: Record<string, string[]>;
  /** What the person typed, so fields keep it after an error. */
  values?: Record<string, string>;
  succeeded?: boolean;
}

export const initialFormState: FormState = {};
