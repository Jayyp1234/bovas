interface DemoAccountsProps {
  accounts: { workspace: string; email: string }[];
  password: string;
}

/** Sign-in help for testers. Only rendered in development or when no PHP API is connected. */
export function DemoAccounts({ accounts, password }: DemoAccountsProps) {
  return (
    <aside className="mt-8 w-full max-w-md rounded-xl border border-dashed border-border bg-muted/50 p-4 text-sm">
      <p className="font-medium text-foreground">Demo accounts</p>
      <p className="mt-1 text-muted-foreground">
        Password for every account: <span className="font-mono text-foreground">{password}</span>
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {accounts.map((account) => (
          <div key={account.email} className="contents">
            <dt className="text-muted-foreground">{account.workspace}</dt>
            <dd className="select-all truncate font-mono text-foreground">{account.email}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
