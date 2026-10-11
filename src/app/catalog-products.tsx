"use client";

import { FirebaseError } from "firebase/app";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { productFromData, type Product } from "@/types/product";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    console.error("Firestore public catalog error:", {
      code: error.code,
      message: error.message,
    });
    return `No se pudo cargar el catálogo (${error.code}): ${error.message}`;
  }

  const message =
    error instanceof Error ? error.message : "Error desconocido de Firestore.";
  console.error("Firestore public catalog error:", message);
  return message;
}

export default function CatalogProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todo el catálogo");

  useEffect(() => {
    const activeProducts = query(
      collection(db, "products"),
      where("isActive", "==", true),
      where("isDeleted", "==", false),
    );

    return onSnapshot(
      activeProducts,
      (snapshot) => {
        try {
          setProducts(
            snapshot.docs.map((productDoc) =>
              productFromData(productDoc.id, productDoc.data()),
            ),
          );
          setErrorMessage(null);
        } catch (error: unknown) {
          setErrorMessage(getErrorMessage(error));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setErrorMessage(getErrorMessage(error));
        setLoading(false);
      },
    );
  }, []);

  const categories = useMemo(
    () => [
      "Todo el catálogo",
      ...new Set(products.map((product) => product.category)),
    ],
    [products],
  );

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todo el catálogo" ||
      product.category === selectedCategory;
    const searchTerm = search.trim().toLocaleLowerCase();
    const matchesSearch =
      searchTerm.length === 0 ||
      `${product.name} ${product.description} ${product.category}`
        .toLocaleLowerCase()
        .includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                selectedCategory === category
                  ? "bg-white text-dark-bg"
                  : "border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <label className="flex h-11 w-full shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-dark-surface px-4 text-zinc-500 transition focus-within:border-primary-blue/60 sm:max-w-xs">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos"
            aria-label="Buscar productos"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </label>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div
          role="status"
          className="mt-7 flex min-h-40 items-center justify-center text-sm text-zinc-400"
        >
          <span className="mr-3 size-5 animate-spin rounded-full border-2 border-white/15 border-t-primary-blue" />
          Cargando catálogo...
        </div>
      ) : visibleProducts.length === 0 ? (
        <p className="mt-7 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-400">
          {errorMessage
            ? "No fue posible mostrar los productos."
            : "No hay productos disponibles para esta búsqueda."}
        </p>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-white/8 bg-dark-surface transition duration-300 hover:-translate-y-1 hover:border-white/15"
            >
              <div className="relative flex aspect-[1.12/1] items-center justify-center overflow-hidden bg-[#172d49]">
                {product.imageUrls[0] ? (
                  <Image
                    src={product.imageUrls[0]}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-blue-200/60">
                    {product.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] font-medium text-white/80 backdrop-blur">
                  {product.category}
                </span>
                <a
                  href="#contacto"
                  aria-label={`Consultar por ${product.name}`}
                  className="absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-white text-dark-bg opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
                >
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
              <div className="p-3.5 sm:p-4">
                <h3 className="truncate text-sm font-medium text-white sm:text-base">
                  {product.name}
                </h3>
                <p className="mt-2 text-xs font-medium text-zinc-400">
                  Desde {currency.format(product.priceUnit)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
