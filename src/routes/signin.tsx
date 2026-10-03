import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { api, useStore } from "@/lib/store";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — FrameVote" },
      { name: "description", content: "Sign in to vote and manage your entries." },
      { property: "og:title", content: "Sign in — FrameVote" },
      { property: "og:description", content: "Sign in to vote and manage your entries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const profiles = useStore((s) => s.profiles);
  const nav = useNavigate();
  return (
    <Shell>
      <div className="card mx-auto max-w-md p-6">
        <h1 className="font-display text-3xl">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo mode: choose an account. With a backend, this becomes email/password sign-in.
        </p>
        <div className="mt-5 space-y-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              className="btn-ghost flex w-full justify-between"
              onClick={() => {
                api.signIn(p.id);
                nav({ to: "/" });
              }}
            >
              <span>{p.display_name}</span>
              <span className="text-muted-foreground">{p.role}</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
