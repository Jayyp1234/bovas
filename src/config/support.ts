/** Answers for each workspace's Support page. */
import type { Role } from "@/lib/api/types";

export interface Faq {
  question: string;
  answer: string;
}

const ACCOUNT: Faq[] = [
  {
    question: "How do I change my password?",
    answer:
      "Open Settings and use Change Password. You'll need your current password. Other devices you're signed in on are signed out.",
  },
  {
    question: "I forgot my password.",
    answer:
      "Sign out, choose Forgot password on the sign-in page and enter your work email. The reset link works for 60 minutes.",
  },
  {
    question: "My email, terminal or job title is wrong.",
    answer: "Only an admin can change those. Send a request below and say what needs correcting.",
  },
];

const BY_ROLE: Record<Role, Faq[]> = {
  logistics: [
    {
      question: "How do I start a loading ticket?",
      answer:
        "Open Loading Program and choose Start Ticket on the truck. The form is filled from the program; check the driver and destinations, preview the ticket and choose Create Ticket.",
    },
    {
      question: "Can I change a ticket after creating it?",
      answer:
        "Yes, until Safety has inspected the truck. Open the ticket from Ticket History and choose Edit. After Safety decides, the ticket is locked so the record stays accurate.",
    },
    {
      question: "Safety rejected a truck. What now?",
      answer:
        "The notification and ticket show the reason. The ticket can't be reused; once the problem is fixed, start a new ticket for the truck from the loading program.",
    },
    {
      question: "How do I export tickets?",
      answer:
        "In Ticket History or Reports, set the period and filters you want, then choose Export CSV. The file matches what's on screen.",
    },
  ],
  safety: [
    {
      question: "Why can't I approve a truck?",
      answer:
        "Approval needs every item on the checklist ticked. If something is missing, reject the truck and pick the reason so Logistics knows what to fix.",
    },
    {
      question: "The queue doesn't show a new truck.",
      answer:
        "The queue refreshes every 30 seconds. If a truck still isn't there, check with Logistics that its ticket has been created.",
    },
    {
      question: "I recorded the wrong decision.",
      answer:
        "Inspections can't be changed once recorded. Send a request below with the ticket number and an admin will follow up.",
    },
  ],
  dispatch: [
    {
      question: "What counts as an overload?",
      answer:
        "Loading more than the truck holds, or more than the requested litres plus the tolerance an admin sets. The form shows the limit before you record the litres.",
    },
    {
      question: "A truck is waiting for overload approval.",
      answer:
        "Admins are notified straight away. When one approves, the truck moves to Waybills; if they refuse, it can't be dispatched on that ticket.",
    },
    {
      question: "How do I print a waybill?",
      answer: "Issue the waybill from Waybills, then choose Print Waybill. You can print it again from the same screen.",
    },
  ],
  admin: [
    {
      question: "How do I upload the day's loading program?",
      answer:
        "On the Home dashboard choose Upload Loading Program. Every row is checked before anything is saved; the template is linked in the dialog.",
    },
    {
      question: "Deactivate or delete a staff member?",
      answer:
        "Deactivate staff who have left: they're signed out and their history stays. Only profiles with no ticket history can be deleted.",
    },
    {
      question: "Where do I change terminals, the checklist or the overload tolerance?",
      answer: "In Settings under Depot. Each section saves on its own and takes effect straight away.",
    },
  ],
};

export function supportFaqs(role: Role): Faq[] {
  return [...BY_ROLE[role], ...ACCOUNT];
}
