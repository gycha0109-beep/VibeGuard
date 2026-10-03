import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { NeedSignIn, Shell, useMe } from "@/components/Shell";
import { api, useStore, type Profile } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — FrameVote" },
      { name: "description", content: "View and update your FrameVote profile." },
      { property: "og:title", content: "Your profile — FrameVote" },
      { property: "og:description", content: "View and update your FrameVote profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = useMe();
  if (!me) return <Shell><NeedSignIn what="see your profile" /></Shell>;
  return <Shell><ProfileForm key={me.id} me={me} /></Shell>;
}

function ProfileForm({ me }: { me: Profile }) {
  const mine = useStore((s) => s.entries.filter((e) => e.owner_id === me.id));
  const [f, setF] = useState({ display_name: me.display_name, bio: me.bio });
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form className="card space-y-4 p-6" onSubmit={(e) => {
        e.preventDefault();
        if (!f.display_name.trim()) return;
        api.updateProfile({ display_name: f.display_name.trim().slice(0, 60), bio: f.bio.slice(0, 500) });
        api.track("profile_update"); setSaved(true);
      }}>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground">{me.email} · {me.role}</p>
        <label className="field">Display name<input className="input" maxLength={60} value={f.display_name} onChange={(e) => { setF({ ...f, display_name: e.target.value }); setSaved(false); }} /></label>
        <label className="field">Bio<textarea className="input min-h-24" maxLength={500} value={f.bio} onChange={(e) => { setF({ ...f, bio: e.target.value }); setSaved(false); }} /></label>
        <button className="btn-primary">Save</button>{saved && <span className="ml-3 text-sm text-primary">Saved</span>}
      </form>
      <div className="card p-6">
        <h2 className="font-display text-2xl">My entries</h2>
        <ul className="mt-4 space-y-2">
          {mine.length === 0 && <li className="text-muted-foreground">No entries yet.</li>}
          {mine.map((e) => (
            <li key={e.id} className="flex justify-between">
              <Link to="/entries/$id" params={{ id: e.id }} className="nav-link">{e.title}</Link>
              <Link to="/entries/$id/edit" params={{ id: e.id }} className="text-sm text-primary">Edit</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}