"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import type { Faq } from "@/config/support";
import { sendSupportRequestAction } from "../actions";

const BODY_LIMIT = 2000;

export function SupportCenter({ faqs }: { faqs: Faq[] }) {
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await sendSupportRequestAction({ subject, body });
      if (result.ok) {
        toast(result.message);
        setSubject("");
        setBody("");
        setErrors({});
        setMessage(undefined);
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answers to common questions, and a way to reach the admin team.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground">Frequently asked questions</h2>
          <div className="mt-2 divide-y divide-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground">Ask the admin team</h2>
          <p className="mt-1 text-sm text-muted-foreground">Admins get a notification and an email straight away.</p>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            {message && (
              <p role="alert" className="rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
                {message}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={subject}
                maxLength={120}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Waybill printer at the gate"
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby={errors.subject ? "support-subject-error" : undefined}
                className="h-11 rounded-xl"
              />
              <FieldError id="support-subject-error" message={errors.subject?.[0]} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-body">What do you need help with?</Label>
              <Textarea
                id="support-body"
                value={body}
                maxLength={BODY_LIMIT}
                rows={6}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Include ticket or truck numbers if it's about a truck."
                aria-invalid={errors.body ? true : undefined}
                aria-describedby={errors.body ? "support-body-error support-body-count" : "support-body-count"}
              />
              <div className="flex justify-between gap-3">
                <FieldError id="support-body-error" message={errors.body?.[0]} />
                <p id="support-body-count" className="ml-auto text-xs text-muted-foreground">
                  {body.length}/{BODY_LIMIT}
                </p>
              </div>
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              <Send className="size-4" aria-hidden />
              {pending ? "Sending…" : "Send Request"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
