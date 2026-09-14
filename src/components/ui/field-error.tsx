/** The message under a form field. Renders nothing when there's no error. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-danger">
      {message}
    </p>
  );
}
