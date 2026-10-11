"use client";

import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import Image from "next/image";
import {
  Archive,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { db } from "@/lib/firebase";
import {
  productData,
  productFromData,
  type Product,
  type ProductData,
} from "@/types/product";

type ProductForm = {
  name: string;
  description: string;
  category: string;
  imageUrls: string;
  priceUnit: string;
  priceDozen: string;
  price100: string;
  price1000: string;
  isActive: boolean;
};

type ProductTab = "active" | "trash";

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  imageUrls: "",
  priceUnit: "",
  priceDozen: "",
  price100: "",
  price1000: "",
  isActive: true,
};

const productFields: (keyof ProductData)[] = [
  "name",
  "description",
  "category",
  "imageUrls",
  "priceUnit",
  "priceDozen",
  "price100",
  "price1000",
  "isActive",
  "isDeleted",
];

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const inputClass =
  "mt-1.5 min-h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-primary-blue/60";

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    console.error("Firestore product management error:", {
      code: error.code,
      message: error.message,
    });
    return `Error de Firestore (${error.code}): ${error.message}`;
  }

  const message =
    error instanceof Error ? error.message : "Error desconocido de Firestore.";
  console.error("Firestore product management error:", {
    code: "unknown",
    message,
  });
  return message;
}

function formFromProduct(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls.join("\n"),
    priceUnit: String(product.priceUnit),
    priceDozen: String(product.priceDozen),
    price100: String(product.price100),
    price1000: String(product.price1000),
    isActive: product.isActive,
  };
}

function makeProductData(form: ProductForm): ProductData {
  const name = form.name.trim();
  const description = form.description.trim();
  const category = form.category.trim();
  const imageUrls = form.imageUrls
    .split(/\r?\n/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean);

  if (!name || !description || !category) {
    throw new Error("Completa el nombre, la descripción y la categoría.");
  }
  if (imageUrls.length === 0) {
    throw new Error("Agrega al menos una URL de imagen.");
  }

  for (const imageUrl of imageUrls) {
    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error();
      }
    } catch {
      throw new Error(`La URL de imagen no es válida: ${imageUrl}`);
    }
  }

  function parsePrice(value: string): number {
    if (!value.trim()) {
      throw new Error("Completa todos los precios.");
    }
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Los precios deben ser números iguales o mayores que cero.");
    }
    return price;
  }

  return {
    name,
    description,
    category,
    imageUrls,
    priceUnit: parsePrice(form.priceUnit),
    priceDozen: parsePrice(form.priceDozen),
    price100: parsePrice(form.price100),
    price1000: parsePrice(form.price1000),
    isActive: form.isActive,
    isDeleted: false,
  };
}

function ProductImages({ product }: { product: Product }) {
  const imageUrl = product.imageUrls[0];

  return (
    <div className="relative aspect-[16/10] bg-white/5">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center text-zinc-500">
          <ImagePlus size={26} aria-hidden="true" />
        </div>
      )}
      {product.imageUrls.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white">
          +{product.imageUrls.length - 1} imágenes
        </span>
      )}
    </div>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<ProductTab>("active");
  const [confirmingPermanentDelete, setConfirmingPermanentDelete] =
    useState<Product | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const migratingIds = new Set<string>();

    return onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        try {
          const migrationCandidates: Product[] = [];
          const loadedProducts = snapshot.docs.map((productDoc) => {
            const rawData = productDoc.data();
            const product = productFromData(productDoc.id, rawData);
            const hasCurrentSchema =
              Object.keys(rawData).length === productFields.length &&
              productFields.every((field) => Object.hasOwn(rawData, field));

            if (!hasCurrentSchema && !migratingIds.has(product.id)) {
              migrationCandidates.push(product);
              migratingIds.add(product.id);
            }

            return product;
          });

          setProducts(loadedProducts);
          setErrorMessage(null);

          void Promise.all(
            migrationCandidates.map(async (product) => {
              try {
                await setDoc(
                  doc(db, "products", product.id),
                  productData(product),
                );
              } catch (error: unknown) {
                setErrorMessage(getErrorMessage(error));
              } finally {
                migratingIds.delete(product.id);
              }
            }),
          );
        } catch (error: unknown) {
          setErrorMessage(getErrorMessage(error));
        } finally {
          setLoadingProducts(false);
        }
      },
      (error) => {
        setErrorMessage(getErrorMessage(error));
        setLoadingProducts(false);
      },
    );
  }, []);

  const activeProducts = products.filter((product) => !product.isDeleted);
  const trashedProducts = products.filter((product) => product.isDeleted);
  const displayedProducts =
    activeTab === "active" ? activeProducts : trashedProducts;

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm(formFromProduct(product));
    setFormOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    let data: ProductData;
    try {
      data = makeProductData(form);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Revisa los datos del producto.",
      );
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await setDoc(doc(db, "products", editingId), data);
        setSuccessMessage("Producto actualizado correctamente.");
      } else {
        await addDoc(collection(db, "products"), data);
        setSuccessMessage("Producto creado correctamente.");
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function writeProduct(product: Product, changes: Partial<ProductData>) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setBusyId(product.id);
    try {
      await setDoc(doc(db, "products", product.id), {
        ...productData(product),
        ...changes,
      });
      setSuccessMessage(`Se actualizó "${product.name}".`);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveToTrash(product: Product) {
    if (!window.confirm(`¿Mover "${product.name}" a Desincorporados?`)) return;
    await writeProduct(product, { isDeleted: true });
  }

  async function handleRestore(product: Product) {
    await writeProduct(product, { isDeleted: false });
  }

  async function handlePermanentDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !confirmingPermanentDelete ||
      deleteConfirmation !== "ELIMINAR DEFINITIVAMENTE"
    ) {
      return;
    }

    const product = confirmingPermanentDelete;
    setErrorMessage(null);
    setSuccessMessage(null);
    setBusyId(product.id);
    try {
      await deleteDoc(doc(db, "products", product.id));
      setSuccessMessage(`Se eliminó definitivamente "${product.name}".`);
      setConfirmingPermanentDelete(null);
      setDeleteConfirmation("");
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  function updateForm<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950 p-4 sm:p-6 lg:p-7">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary-blue">
            Catálogo
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
            Gestión de productos
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Administra disponibilidad, precios e imágenes del catálogo.
          </p>
        </div>
        {activeTab === "active" && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary-blue px-5 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo producto
          </button>
        )}
      </header>

      <nav
        aria-label="Secciones de productos"
        className="mb-5 flex gap-2 border-b border-white/10"
      >
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          aria-current={activeTab === "active" ? "page" : undefined}
          className={`border-b-2 px-3 py-2.5 text-sm transition ${
            activeTab === "active"
              ? "border-primary-blue text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Productos
          <span className="ml-2 text-xs text-zinc-500">
            {activeProducts.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trash")}
          aria-current={activeTab === "trash" ? "page" : undefined}
          className={`border-b-2 px-3 py-2.5 text-sm transition ${
            activeTab === "trash"
              ? "border-primary-blue text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Desincorporados
          <span className="ml-2 text-xs text-zinc-500">
            {trashedProducts.length}
          </span>
        </button>
      </nav>

      {errorMessage && (
        <p
          role="alert"
          className="mb-4 whitespace-pre-line rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-200"
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
        >
          {successMessage}
        </p>
      )}

      {loadingProducts ? (
        <div
          role="status"
          className="flex min-h-36 items-center justify-center text-sm text-zinc-400"
        >
          <span className="mr-3 size-5 animate-spin rounded-full border-2 border-white/15 border-t-primary-blue" />
          Cargando productos...
        </div>
      ) : displayedProducts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-400">
          {activeTab === "trash"
            ? "La papelera está vacía."
            : "Todavía no hay productos registrados."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {displayedProducts.map((product) => (
            <li
              key={product.id}
              className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"
            >
              <ProductImages product={product} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{product.name}</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      {product.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      product.isDeleted
                        ? "bg-amber-400/10 text-amber-200"
                        : product.isActive
                          ? "bg-emerald-400/10 text-emerald-200"
                          : "bg-zinc-400/10 text-zinc-300"
                    }`}
                  >
                    {product.isDeleted
                      ? "Desincorporado"
                      : product.isActive
                        ? "Activo"
                        : "Inactivo"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">
                  {product.description}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/8 pt-3 text-xs">
                  <div className="flex justify-between gap-2 text-zinc-500">
                    <dt>Unidad</dt>
                    <dd className="text-zinc-200">
                      {currency.format(product.priceUnit)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 text-zinc-500">
                    <dt>Docena</dt>
                    <dd className="text-zinc-200">
                      {currency.format(product.priceDozen)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 text-zinc-500">
                    <dt>100 und.</dt>
                    <dd className="text-zinc-200">
                      {currency.format(product.price100)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 text-zinc-500">
                    <dt>1000 und.</dt>
                    <dd className="text-zinc-200">
                      {currency.format(product.price1000)}
                    </dd>
                  </div>
                </dl>

                {activeTab === "active" ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.isActive}
                      aria-label={`Producto ${product.name}: ${product.isActive ? "activo" : "inactivo"}`}
                      onClick={() =>
                        void writeProduct(product, {
                          isActive: !product.isActive,
                        })
                      }
                      disabled={busyId !== null || saving}
                      className="inline-flex min-h-9 items-center gap-2 text-xs text-zinc-300 disabled:opacity-50"
                    >
                      <span
                        className={`relative h-5 w-9 rounded-full transition ${
                          product.isActive ? "bg-primary-blue" : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-4 rounded-full bg-white transition ${
                            product.isActive ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </span>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        disabled={busyId !== null || saving}
                        aria-label={`Editar ${product.name}`}
                        className="grid size-9 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleMoveToTrash(product)}
                        disabled={busyId !== null || saving}
                        aria-label={`Mover ${product.name} a Desincorporados`}
                        className="grid size-9 place-items-center rounded-full border border-amber-400/20 text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-50"
                      >
                        {busyId === product.id ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-amber-100/20 border-t-amber-100" />
                        ) : (
                          <Archive size={15} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleRestore(product)}
                      disabled={busyId !== null}
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full border border-primary-blue/30 px-3 text-xs font-semibold text-blue-200 transition hover:bg-primary-blue/10 disabled:opacity-50"
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                      {busyId === product.id ? "Procesando..." : "Restaurar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingPermanentDelete(product);
                        setDeleteConfirmation("");
                      }}
                      disabled={busyId !== null}
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full border border-red-400/20 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Eliminar definitivamente
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="my-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-dark-surface p-5 shadow-2xl sm:p-6"
          >
            <header className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-blue">
                  {editingId ? "Actualizar catálogo" : "Nuevo registro"}
                </p>
                <h3
                  id="product-form-title"
                  className="mt-1 text-xl font-semibold"
                >
                  {editingId ? "Editar producto" : "Agregar producto"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Cerrar formulario"
                className="grid size-9 place-items-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 disabled:opacity-50"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs text-zinc-300">
                  Nombre
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Categoría
                  <input
                    required
                    maxLength={80}
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Precio por unidad
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceUnit}
                    onChange={(event) =>
                      updateForm("priceUnit", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Precio por docena
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceDozen}
                    onChange={(event) =>
                      updateForm("priceDozen", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Precio desde 100 und.
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price100}
                    onChange={(event) =>
                      updateForm("price100", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Precio desde 1000 und.
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price1000}
                    onChange={(event) =>
                      updateForm("price1000", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-xs text-zinc-300 sm:col-span-2 lg:col-span-3">
                  Descripción
                  <textarea
                    required
                    maxLength={2000}
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    className={`${inputClass} resize-y py-2`}
                  />
                </label>
                <label className="text-xs text-zinc-300 sm:col-span-2 lg:col-span-3">
                  URLs de imágenes (una por línea)
                  <textarea
                    required
                    rows={2}
                    value={form.imageUrls}
                    onChange={(event) =>
                      updateForm("imageUrls", event.target.value)
                    }
                    placeholder={"https://ejemplo.com/producto-1.jpg\nhttps://ejemplo.com/producto-2.jpg"}
                    className={`${inputClass} resize-y py-2`}
                  />
                </label>
              </div>

              <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm("isActive", event.target.checked)
                  }
                  className="size-4 accent-primary-blue"
                />
                Publicar como activo
              </label>

              {errorMessage && (
                <p
                  role="alert"
                  className="whitespace-pre-line rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                >
                  {errorMessage}
                </p>
              )}

              <footer className="flex flex-col-reverse gap-2 border-t border-white/8 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="min-h-10 rounded-full border border-white/10 px-5 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary-blue px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={15} aria-hidden="true" />
                      {editingId ? "Guardar cambios" : "Crear producto"}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {confirmingPermanentDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="permanent-delete-title"
            aria-describedby="permanent-delete-description"
            className="w-full max-w-md rounded-2xl border border-red-400/20 bg-dark-surface p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-red-400/10 text-red-200">
              <Trash2 size={20} aria-hidden="true" />
            </div>
            <h3 id="permanent-delete-title" className="text-lg font-semibold">
              Eliminar definitivamente
            </h3>
            <p
              id="permanent-delete-description"
              className="mt-2 text-sm leading-6 text-zinc-400"
            >
              <span className="font-medium text-white">
                {confirmingPermanentDelete.name}
              </span>{" "}
              se borrará de Firestore y no se podrá restaurar. Para confirmar,
              escribe <strong className="text-red-200">ELIMINAR DEFINITIVAMENTE</strong>.
            </p>
            <form onSubmit={handlePermanentDelete} className="mt-5">
              <input
                autoFocus
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                aria-label="Confirmación para eliminar definitivamente"
                className={inputClass}
              />
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmingPermanentDelete(null)}
                  disabled={busyId === confirmingPermanentDelete.id}
                  className="min-h-10 rounded-full border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    deleteConfirmation !== "ELIMINAR DEFINITIVAMENTE" ||
                    busyId === confirmingPermanentDelete.id
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busyId === confirmingPermanentDelete.id
                    ? "Eliminando..."
                    : "Eliminar para siempre"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
