import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/Shell";
import { api, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrameVote — Image gallery & voting" },
      { name: "description", content: "Browse published photo entries and vote for your favorites." },
      { property: "og:title", content: "FrameVote — Image gallery & voting" },
      { property: "og:description", content: "Browse published photo entries and vote for your favorites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const entries = useStore((s) => s.entries);
  const votes = useStore((s) => s.votes);
  useEffect(() => api.track("entry_list_view"), []);
  const list = entries.filter((e) => e.published);
  return (
    <Shell>
      <h1 className="font-display text-4xl md:text-6xl">This week's frames</h1>
      <p className="mt-2 text-muted-foreground">Open an entry, cast your vote, see where it stands.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <Link key={e.id} to="/entries/$id" params={{ id: e.id }} className="card group overflow-hidden">
            <img src={e.image_url} alt={e.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="flex items-center justify-between p-4">
              <span className="font-medium">{e.title}</span>
              <span className="text-sm text-muted-foreground">{votes.filter((v) => v.poll_id === `p-${e.id}`).length} votes</span>
            </div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}