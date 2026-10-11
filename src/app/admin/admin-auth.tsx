"use client";

import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { LockKeyhole, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { auth } from "@/lib/firebase";
import ProductManager from "./product-manager";

const ADMIN_EMAIL = "monsteruser2021@gmail.com";

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Firebase Auth error:", {
      code: "unknown",
      message,
    });
    return `Error desconocido: ${message}`;
  }

  console.error("Firebase Auth error:", {
    code: error.code,
    message: error.message,
  });

  let guidance: string;
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      guidance = "Verifica que el correo y la contraseña sean correctos.";
      break;
    case "auth/invalid-email":
      guidance = "Verifica el formato del correo electrónico.";
      break;
    case "auth/user-disabled":
      guidance = "La cuenta está deshabilitada. Contacta al administrador.";
      break;
    case "auth/too-many-requests":
      guidance = "Espera un momento antes de volver a intentarlo.";
      break;
    case "auth/network-request-failed":
      guidance = "Revisa la conexión a internet e inténtalo de nuevo.";
      break;
    case "auth/unauthorized-domain":
      guidance =
        "Agrega el dominio actual a Firebase Console > Authentication > Settings > Authorized domains.";
      break;
    case "auth/operation-not-allowed":
      guidance =
        "Habilita el proveedor Correo/Contraseña en Firebase Console > Authentication > Sign-in method.";
      break;
    case "auth/invalid-api-key":
      guidance =
        "Verifica NEXT_PUBLIC_FIREBASE_API_KEY en .env.local y reinicia Next.js.";
      break;
    default:
      guidance = "Consulta el código y mensaje de Firebase mostrados abajo.";
  }

  return `${guidance}\nCódigo: ${error.code}\nMensaje: ${error.message}`;
}

export default function AdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        if (
          currentUser &&
          currentUser.email?.toLowerCase() !== ADMIN_EMAIL
        ) {
          setUser(null);
          setErrorMessage(
            `Solo ${ADMIN_EMAIL} tiene acceso al panel de administración.`,
          );
          setLoading(false);

          void signOut(auth).catch((error: unknown) => {
            setErrorMessage(
              `La cuenta no tiene acceso y no se pudo cerrar su sesión: ${getAuthErrorMessage(error)}`,
            );
          });
          return;
        }

        setUser(currentUser);
        setLoading(false);
      },
      (error: Error) => {
        setErrorMessage(getAuthErrorMessage(error));
        setLoading(false);
      },
    );
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      setPassword("");
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signOut(auth);
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Verificando sesión"
        className="flex min-h-[24rem] items-center justify-center"
      >
        <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-primary-blue" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full max-w-7xl">
        <section className="flex flex-col gap-5 rounded-3xl border border-white/8 bg-dark-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-blue/12 text-primary-blue">
              <ShieldCheck size={23} aria-hidden="true" />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-blue">
                Panel de administración
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.045em]">
                ¡Bienvenido!
              </h1>
              <p className="mt-2 break-all text-sm text-zinc-400">
                {user.email ?? "usuario administrador"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <LogOut size={16} aria-hidden="true" />
            {submitting ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
          {errorMessage && (
            <p
              role="alert"
              className="whitespace-pre-line rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 sm:basis-full"
            >
              {errorMessage}
            </p>
          )}
        </section>
        <ProductManager />
      </div>
    );
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-white/8 bg-dark-surface p-7 sm:p-10">
      <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary-blue/12 text-primary-blue">
        <LockKeyhole size={22} aria-hidden="true" />
      </div>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary-blue">
        Acceso seguro
      </p>
      <h1 className="text-3xl font-semibold tracking-[-0.045em]">
        Administración
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Inicia sesión para gestionar el catálogo POP.
      </p>

      <form onSubmit={handleSignIn} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Correo electrónico
          </label>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-dark-bg px-4 transition focus-within:border-primary-blue/60">
            <Mail size={17} className="shrink-0 text-zinc-500" aria-hidden="true" />
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={ADMIN_EMAIL}
              readOnly
              aria-describedby="admin-email-note"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-zinc-300 outline-none"
            />
          </div>
          <p id="admin-email-note" className="mt-2 text-xs text-zinc-500">
            Solo esta cuenta tiene acceso al panel.
          </p>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Contraseña
          </label>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-dark-bg px-4 transition focus-within:border-primary-blue/60">
            <LockKeyhole
              size={17}
              className="shrink-0 text-zinc-500"
              aria-hidden="true"
            />
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="whitespace-pre-line rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-200"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-blue px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
    </section>
  );
}
