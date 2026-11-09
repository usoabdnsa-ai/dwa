import type { Metadata } from "next";
import { LoginView } from "@/v8/account";

export const metadata: Metadata = { title: "Sign in" };

export default function V8LoginPage() {
  return <LoginView />;
}
