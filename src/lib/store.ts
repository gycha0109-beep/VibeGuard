// Demo data layer. Used when Supabase env vars are absent (see SETUP.md).
// Mirrors the tables in supabase/migrations/0001_init.sql.
import { useSyncExternalStore } from "react";

export type Role = "user" | "admin";
export type Profile = { id: string; email: string; display_name: string; bio: string; role: Role; created_at: string };
export type Entry = { id: string; owner_id: string; title: string; description: string; image_url: string; published: boolean; created_at: string };
export type Poll = { id: string; entry_id: string; question: string; is_open: boolean };
export type Vote = { poll_id: string; user_id: string; created_at: string };
export type EventName = "entry_list_view" | "entry_view" | "entry_edit" | "vote_submit" | "result_view" | "profile_update" | "sign_in";
export type UserEvent = { id: string; user_id: string | null; name: EventName; entry_id: string | null; created_at: string };

type State = { profiles: Profile[]; entries: Entry[]; polls: Poll[]; votes: Vote[]; events: UserEvent[]; sessionUserId: string | null };

const t0 = "2026-09-01T10:00:00.000Z";
function seed(): State {
  const profiles: Profile[] = [
    { id: "u-admin", email: "admin@demo.local", display_name: "Demo Admin", bio: "Runs the gallery.", role: "admin", created_at: t0 },
    { id: "u-ana", email: "ana@demo.local", display_name: "Ana", bio: "Street photographer.", role: "user", created_at: t0 },
    { id: "u-ben", email: "ben@demo.local", display_name: "Ben", bio: "Landscapes mostly.", role: "user", created_at: t0 },
  ];
  const owners = ["u-ana", "u-ben", "u-ana", "u-ben", "u-admin", "u-ana"];
  const titles = ["Harbor at dawn", "Ridge line", "Neon alley", "Quiet forest", "Concrete curves", "Market colors"];
  const entries: Entry[] = titles.map((title, i) => ({
    id: `e-${i + 1}`, owner_id: owners[i] ?? "u-ana", title, description: "Demo entry (synthetic data).",
    image_url: `https://picsum.photos/seed/vote${i + 1}/800/600`, published: true, created_at: t0,
  }));
  const polls: Poll[] = entries.map((e) => ({ id: `p-${e.id}`, entry_id: e.id, question: "Do you like this shot?", is_open: e.id !== "e-4" }));
  const votes: Vote[] = [
    { poll_id: "p-e-1", user_id: "u-ben", created_at: t0 },
    { poll_id: "p-e-1", user_id: "u-admin", created_at: t0 },
    { poll_id: "p-e-2", user_id: "u-ana", created_at: t0 },
    { poll_id: "p-e-4", user_id: "u-ana", created_at: t0 },
  ];
  return { profiles, entries, polls, votes, events: [], sessionUserId: null };
}

const KEY = "vote-demo-v1";
let state: State = seed();
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
}
function set(fn: (s: State) => State) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const serverSnap = seed();
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); if (!loaded) { load(); queueMicrotask(cb); } return () => subs.delete(cb); },
    () => sel(state),
    () => sel(serverSnap),
  );
}

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export const api = {
  track(name: EventName, entry_id: string | null = null) {
    set((s) => ({ ...s, events: [...s.events, { id: id(), user_id: s.sessionUserId, name, entry_id, created_at: now() }] }));
  },
  signIn(userId: string) { set((s) => ({ ...s, sessionUserId: userId })); api.track("sign_in"); },
  signOut() { set((s) => ({ ...s, sessionUserId: null })); },
  vote(pollId: string) {
    set((s) => {
      const uid = s.sessionUserId; const poll = s.polls.find((p) => p.id === pollId);
      if (!uid || !poll?.is_open || s.votes.some((v) => v.poll_id === pollId && v.user_id === uid)) return s;
      return { ...s, votes: [...s.votes, { poll_id: pollId, user_id: uid, created_at: now() }] };
    });
  },
  updateEntry(entryId: string, patch: Pick<Entry, "title" | "description" | "image_url" | "published">) {
    set((s) => ({ ...s, entries: s.entries.map((e) => (e.id === entryId && e.owner_id === s.sessionUserId ? { ...e, ...patch } : e)) }));
  },
  updateProfile(patch: Pick<Profile, "display_name" | "bio">) {
    set((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === s.sessionUserId ? { ...p, ...patch } : p)) }));
  },
  reset() { set(() => seed()); },
};

export function eventsCsv(s: { events: UserEvent[]; profiles: Profile[] }) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = s.events.map((e) => {
    const p = s.profiles.find((x) => x.id === e.user_id);
    return [e.id, e.created_at, e.user_id ?? "", p?.email ?? "", e.name, e.entry_id ?? ""].map(esc).join(",");
  });
  return ["id,created_at,user_id,email,event,entry_id", ...rows].join("\n");
}