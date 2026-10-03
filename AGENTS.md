<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- App data goes through `api`/`useStore` in src/lib/store.ts (demo localStorage backend); swap implementations there when a real backend is connected — single seam keeps pages backend-agnostic.
- Schema/RLS lives in db/schema.sql; roles in separate user_roles table checked via has_role().
