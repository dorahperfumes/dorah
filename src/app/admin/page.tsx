"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";

import AdminApp from "@/components/admin/AdminApp";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    setSession(data.session);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setEmail("");
    setPassword("");
  }

  if (checkingSession) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingText}>Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <Image
              src="/dorah-logo.png"
              alt="Dorah Perfumes & Accesorios"
              width={190}
              height={90}
              style={{
                width: "190px",
                height: "auto",
                objectFit: "contain",
              }}
              priority
            />
          </div>

          <div style={styles.separator} />

          <p style={styles.eyebrow}>PERFUMES & ACCESORIOS</p>

          <h1 style={styles.title}>Panel de Administración</h1>

          <p style={styles.subtitle}>
            Ingresá con tu cuenta de administrador para continuar.
          </p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="admin-email" style={styles.label}>
                CORREO ELECTRÓNICO
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="admin-password" style={styles.label}>
                CONTRASEÑA
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
                style={styles.input}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.65 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "INGRESANDO..." : "INGRESAR"}
            </button>
          </form>

          <p style={styles.footer}>
            Acceso exclusivo para administración de Dorah.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        style={styles.logoutButton}
        title="Cerrar sesión"
      >
        CERRAR SESIÓN
      </button>

      <AdminApp />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #1a1711 0%, #0a0908 50%, #050504 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Jost', Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#faf7f0",
    border: "1px solid rgba(201, 164, 85, 0.6)",
    borderRadius: "6px",
    padding: "38px 36px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  },

  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  separator: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, #c9a455, transparent)",
    margin: "22px 0",
  },

  eyebrow: {
    color: "#ad8a3f",
    fontSize: "11px",
    letterSpacing: "0.22em",
    textAlign: "center",
    margin: "0 0 10px",
  },

  title: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "34px",
    lineHeight: 1.1,
    textAlign: "center",
    color: "#1c1913",
    margin: "0 0 10px",
  },

  subtitle: {
    color: "#6b6250",
    fontSize: "14px",
    lineHeight: 1.5,
    textAlign: "center",
    margin: "0 0 28px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#6b6250",
    fontSize: "11px",
    letterSpacing: "0.12em",
  },

  input: {
    width: "100%",
    height: "46px",
    border: "1px solid #e0d4b9",
    borderRadius: "3px",
    background: "#ffffff",
    color: "#1c1913",
    padding: "0 13px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  error: {
    background: "#fff0ed",
    border: "1px solid #e5b5aa",
    color: "#a53e2c",
    padding: "11px 12px",
    borderRadius: "3px",
    fontSize: "13px",
    textAlign: "center",
  },

  button: {
    height: "48px",
    border: "1px solid #0a0908",
    borderRadius: "3px",
    background: "#0a0908",
    color: "#eaddb0",
    fontSize: "13px",
    letterSpacing: "0.12em",
    marginTop: "3px",
  },

  footer: {
    color: "#8b806c",
    fontSize: "11px",
    textAlign: "center",
    margin: "24px 0 0",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#0a0908",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#c9a455",
    fontFamily: "Georgia, serif",
    fontSize: "20px",
  },

  logoutButton: {
    position: "fixed",
    top: "14px",
    right: "18px",
    zIndex: 1000,
    border: "1px solid #c9a455",
    borderRadius: "3px",
    background: "#0a0908",
    color: "#eaddb0",
    padding: "9px 13px",
    fontSize: "10px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,.2)",
  },
};