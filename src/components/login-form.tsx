"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/** Front-end only for now: any well-formed input signs in to the demo pharmacy. */
export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter the email your pharmacy registered with.");
        if (password.length < 6) return setError("Password is at least 6 characters.");
        setError(null);
        setPending(true);
        setTimeout(() => router.push("/dashboard"), 500);
      }}
      className="surface rounded-card p-6 sm:p-8"
    >
      <h2 className="font-display text-xl font-semibold">Pharmacist sign in</h2>
      <div className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="contact@pharmacie-garidi.dz" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green font-medium text-white transition-colors duration-150 hover:bg-green-700 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-4 text-center text-xs text-muted">Demo: any email and a 6+ character password.</p>
    </form>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3.5 ring-1 ring-line outline-none transition-shadow duration-150 placeholder:text-muted focus:ring-2 focus:ring-green"
      />
    </label>
  );
}
