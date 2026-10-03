import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NeedSignIn, Shell, useMe } from "@/components/Shell";
import { api, useStore, type Entry } from "@/lib/store";

export const Route = createFileRoute("/entries/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit entry — FrameVote" },
      { name: "description", content: "Edit your image entry." },
      { property: "og:title", content: "Edit entry — FrameVote" },
      { property: "og:description", content: "Edit your image entry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const me = useMe();
  const entry = useStore((s) => s.entries.find((e) => e.id === id));
  if (!me) return <Shell><NeedSignIn what="edit entries" /></Shell>;
  if (!entry || entry.owner_id !== me.id) return <Shell><p>You can only edit your own entries.</p></Shell>;
  return <Shell><EditForm entry={entry} /></Shell>;
}

function EditForm({ entry }: { entry: Entry }) {
  const nav = useNavigate();
  const [f, setF] = useState({ title: entry.title, description: entry.description, image_url: entry.image_url, published: entry.published });
  return (
    <form
      className="card mx-auto max-w-xl space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.title.trim()) return;
        api.updateEntry(entry.id, { ...f, title: f.title.trim().slice(0, 120), description: f.description.slice(0, 2000) });
        api.track("entry_edit", entry.id);
        nav({ to: "/entries/$id", params: { id: entry.id } });
      }}
    >
      <h1 className="font-display text-3xl">Edit entry</h1>
      <label className="field">Title<input className="input" value={f.title} maxLength={120} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label className="field">Description<textarea className="input min-h-28" value={f.description} maxLength={2000} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <label className="field">Image URL<input className="input" type="url" value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} /></label>
      <p className="text-xs text-muted-foreground">With a backend connected, images upload to your private storage folder.</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Published</label>
      <button className="btn-primary">Save</button>
    </form>
  );
}