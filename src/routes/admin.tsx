import { createFileRoute } from "@tanstack/react-router";
import { NeedSignIn, Shell, useMe } from "@/components/Shell";
import { api, eventsCsv, useStore, type EventName } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — FrameVote" },
      { name: "description", content: "Users, funnel and event export." },
      { property: "og:title", content: "Admin — FrameVote" },
      { property: "og:description", content: "Users, funnel and event export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const funnel: EventName[] = [
  "entry_list_view",
  "entry_view",
  "entry_edit",
  "vote_submit",
  "result_view",
];

function Admin() {
  const me = useMe();
  const profiles = useStore((s) => s.profiles);
  const events = useStore((s) => s.events);
  if (!me)
    return (
      <Shell>
        <NeedSignIn what="open admin" />
      </Shell>
    );
  if (me.role !== "admin")
    return (
      <Shell>
        <p>Admins only.</p>
      </Shell>
    );

  const download = () => {
    const blob = new Blob([eventsCsv({ events, profiles })], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Admin</h1>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={download}>
            Export events CSV
          </button>
          <button className="btn-ghost" onClick={() => api.reset()}>
            Reset demo data
          </button>
        </div>
      </div>
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {funnel.map((n) => (
          <div key={n} className="card p-4">
            <div className="text-xs text-muted-foreground">{n}</div>
            <div className="font-display text-3xl">{events.filter((e) => e.name === n).length}</div>
            <div className="text-xs text-muted-foreground">
              {new Set(events.filter((e) => e.name === n).map((e) => e.user_id)).size} users
            </div>
          </div>
        ))}
      </section>
      <section className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Events</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.display_name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.role}</td>
                <td className="p-3">{events.filter((e) => e.user_id === p.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
