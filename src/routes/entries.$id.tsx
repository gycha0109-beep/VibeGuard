import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, useMe } from "@/components/Shell";
import { api, useStore } from "@/lib/store";

export const Route = createFileRoute("/entries/$id")({
  head: () => ({
    meta: [
      { title: "Entry — FrameVote" },
      { name: "description", content: "View this image entry and vote." },
      { property: "og:title", content: "Entry — FrameVote" },
      { property: "og:description", content: "View this image entry and vote." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const { id } = Route.useParams();
  const me = useMe();
  const entry = useStore((s) => s.entries.find((e) => e.id === id));
  const poll = useStore((s) => s.polls.find((p) => p.entry_id === id));
  const votes = useStore((s) => s.votes);
  const owner = useStore((s) => s.profiles.find((p) => p.id === entry?.owner_id));
  useEffect(() => api.track("entry_view", id), [id]);

  const count = votes.filter((v) => v.poll_id === poll?.id).length;
  const voted = !!me && votes.some((v) => v.poll_id === poll?.id && v.user_id === me.id);
  const showResult = voted || (poll && !poll.is_open);
  useEffect(() => {
    if (showResult) api.track("result_view", id);
  }, [showResult, id]);

  if (!entry || (!entry.published && entry.owner_id !== me?.id))
    return (
      <Shell>
        <p>Entry not found.</p>
      </Shell>
    );

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <img src={entry.image_url} alt={entry.title} className="card w-full object-cover" />
        <div className="space-y-5">
          <h1 className="font-display text-4xl">{entry.title}</h1>
          <p className="text-muted-foreground">{entry.description}</p>
          <p className="text-sm">by {owner?.display_name ?? "unknown"}</p>
          {me?.id === entry.owner_id && (
            <Link to="/entries/$id/edit" params={{ id }} className="btn-ghost inline-block">
              Edit entry
            </Link>
          )}
          {poll && (
            <div className="card p-5">
              <p className="font-medium">{poll.question}</p>
              {!poll.is_open && <p className="mt-1 text-sm text-muted-foreground">Poll closed.</p>}
              {showResult ? (
                <div className="mt-4">
                  <div className="font-display text-5xl text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {count === 1 ? "vote" : "votes"} so far{voted && " — including yours"}
                  </div>
                </div>
              ) : me ? (
                <button
                  className="btn-primary mt-4"
                  onClick={() => {
                    api.vote(poll.id);
                    api.track("vote_submit", id);
                  }}
                >
                  ♥ Vote
                </button>
              ) : (
                <Link to="/signin" className="btn-primary mt-4 inline-block">
                  Sign in to vote
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
