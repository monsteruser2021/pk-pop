import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Box,
  CupSoda,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import CatalogProducts from "./catalog-products";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg text-white">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-dark-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="POP, inicio" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-blue text-sm font-black tracking-tight text-white">
              p.
            </span>
            <span className="text-lg font-semibold tracking-[-0.04em]">
              pop<span className="text-primary-blue">.</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#catalogo" className="transition hover:text-white">Catálogo</a>
            <a href="#coleccion" className="transition hover:text-white">Colecciones</a>
            <a href="#nosotros" className="transition hover:text-white">Nosotros</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white sm:flex"
            >
              <BadgePercent size={16} aria-hidden="true" />
              Administración
            </Link>
            <Link
              href="/admin"
              aria-label="Administración"
              title="Administración"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:bg-white/5 hover:text-white sm:hidden"
            >
              <LayoutDashboard size={18} aria-hidden="true" />
            </Link>
            <a
              href="#catalogo"
              aria-label="Ir al catálogo"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:bg-white/5 md:hidden"
            >
              <Search size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section id="coleccion" className="relative isolate overflow-hidden border-b border-white/8">
        <div aria-hidden="true" className="absolute -right-24 -top-44 -z-10 size-[34rem] rounded-full bg-primary-blue/15 blur-[110px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-blue/25 bg-primary-blue/10 px-3.5 py-1.5 text-xs font-medium text-blue-200">
              <span className="size-1.5 rounded-full bg-primary-blue" />
              Material POP para marcas que destacan
            </div>
            <h1 className="text-[clamp(2.8rem,7vw,5.4rem)] font-semibold leading-[0.99] tracking-[-0.065em]">
              Ideas que hacen
              <br />
              <span className="text-primary-blue">marca.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Encuentra todo lo que necesitas para llevar tu marca del primer
              vistazo a un recuerdo inolvidable.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#catalogo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-blue px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Explorar catálogo
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
              >
                Hablemos de tu proyecto
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex -space-x-2">
                <span className="grid size-7 place-items-center rounded-full border-2 border-dark-bg bg-[#324661] text-[10px] font-semibold text-blue-100">P</span>
                <span className="grid size-7 place-items-center rounded-full border-2 border-dark-bg bg-[#4c3b55] text-[10px] font-semibold text-purple-100">M</span>
                <span className="grid size-7 place-items-center rounded-full border-2 border-dark-bg bg-[#3a5147] text-[10px] font-semibold text-green-100">C</span>
              </span>
              <span>Marcas que ya se hacen notar</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute inset-8 rounded-[2rem] bg-primary-blue/15 blur-3xl" />
            <div className="relative grid aspect-[1.13/1] grid-cols-2 gap-3 rounded-[2rem] border border-white/10 bg-dark-surface/70 p-3 sm:gap-4 sm:p-4">
              <div className="flex flex-col justify-between overflow-hidden rounded-[1.4rem] bg-[#172d49] p-5 sm:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/65">Colección 01</span>
                <div className="relative flex flex-1 items-center justify-center">
                  <div className="absolute size-36 rounded-full bg-primary-blue/20 blur-2xl sm:size-48" />
                  <Box className="relative size-20 text-blue-300 sm:size-28" strokeWidth={1} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-white sm:text-base">Espacios que venden</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[1.4rem] bg-[#30251e] p-4 sm:p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-200/60">Hecho para ti</span>
                  <div className="flex justify-center">
                    <CupSoda className="size-14 text-orange-200 sm:size-[4.5rem]" strokeWidth={1} aria-hidden="true" />
                  </div>
                  <p className="text-xs font-medium text-white sm:text-sm">Objetos con propósito</p>
                </div>
                <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[1.4rem] bg-[#282744] p-4 sm:p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200/60">Tu identidad</span>
                  <div className="flex justify-center">
                    <ShoppingBag className="size-14 text-purple-200 sm:size-[4.5rem]" strokeWidth={1} aria-hidden="true" />
                  </div>
                  <p className="text-xs font-medium text-white sm:text-sm">Detalles que conectan</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#191c24] px-4 py-3 shadow-2xl sm:-left-8">
                <span className="grid size-9 place-items-center rounded-xl bg-primary-blue/15 text-primary-blue">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-white">Tu marca, en grande</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500">Ideas hechas realidad</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-blue">Encuentra tu siguiente idea</p>
            <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Explora el catálogo</h2>
            <p className="mt-3 text-sm text-zinc-500">Productos para cada punto de contacto con tu marca.</p>
          </div>
        </div>
        <CatalogProducts />

        <div className="mt-9 flex justify-center">
          <a href="#contacto" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white">
            Ver todo el catálogo
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="nosotros" className="border-t border-white/8 bg-dark-surface/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">¿Tienes una idea en mente?</h2>
            <p className="mt-2 text-sm text-zinc-500">Hagamos que tu marca se vea y se sienta diferente.</p>
          </div>
          <a id="contacto" href="mailto:hola@pop.mx" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-sm font-semibold text-dark-bg transition hover:bg-zinc-200 sm:self-auto">
            Cuéntanos tu proyecto
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
