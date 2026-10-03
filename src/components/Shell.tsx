import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { api, useStore } from "@/lib/store";

export function useMe() {
  return useStore((s) => s.profiles.find((p) => p.id === s.sessionUserId) ?? null);
}

export function Shell({ children }: { children: ReactNode }) {
  const me = useMe();
  return (
    <div className="min-h-screen">
      <div className="demo-banner">Demo mode — synthetic data stored in this browser. Connect a backend via SETUP.md.</div>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <Link to="/" className="font-display text-2xl tracking-tight">Frame<span className="text-primary">Vote</span></Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link to="/" className="nav-link">Gallery</Link>
          {me && <Link to="/profile" className="nav-link">Profile</Link>}
          {me?.role === "admin" && <Link to="/admin" className="nav-link">Admin</Link>}
          {me ? (
            <button className="btn-ghost" onClick={() => api.signOut()}>Sign out ({me.display_name})</button>
          ) : (
            <Link to="/signin" className="btn-primary">Sign in</Link>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">{children}</main>
    </div>
  );
}

export function NeedSignIn({ what }: { what: string }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-muted-foreground">Sign in to {what}.</p>
      <Link to="/signin" className="btn-primary mt-4 inline-block">Sign in</Link>
    </div>
  );
}