import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminAuth from "./admin-auth";

export const metadata = {
  title: "Administración",
};

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col bg-dark-bg text-white">
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Volver al catálogo POP">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-blue text-sm font-black tracking-tight text-white">
              p.
            </span>
            <span className="text-lg font-semibold tracking-[-0.04em]">
              pop<span className="text-primary-blue">.</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al catálogo
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <AdminAuth />
      </section>
    </main>
  );
}
