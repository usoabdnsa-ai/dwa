import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Pharmacist sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
      <div>
        <h1 className="max-w-[16ch] font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Your shelf, visible to the whole neighbourhood.
        </h1>
        <p className="mt-4 max-w-[44ch] text-muted">
          Sign in to update quantities. Patients see the change on their next search, so fewer of them arrive for something
          you don’t have.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
