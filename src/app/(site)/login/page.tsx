import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "Pharmacist sign in" };

export default async function LoginPage() {
  const { t } = await getT();
  return (
    <section className="dusk-band">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-32 pb-20 sm:px-6 sm:pt-36 sm:pb-28 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="max-w-[16ch] font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {t("login.title")}
          </h1>
          <p className="mt-4 max-w-[44ch] text-dusk-muted">
            {t("login.lede")}
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
