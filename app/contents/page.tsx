"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const seed = [
  { id: "11111111-1111-1111-1111-111111111111", title: "City after rain", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80" },
  { id: "22222222-2222-2222-2222-222222222222", title: "Warm desk", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80" },
  { id: "33333333-3333-3333-3333-333333333333", title: "Quiet coast", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" }
];

export default function ContentsPage() {
  const items = useMemo(() => seed, []);
  return (
    <main>
      <div className="eyebrow">Community board</div>
      <h1 style={{fontSize:44}}>오늘의 이미지</h1>
      <p className="meta">반응형 이미지 sizing과 lazy loading을 적용한 hardened 화면입니다.</p>
      <section className="grid" style={{marginTop:20}}>
        {items.map((item) => (
          <article className="card" key={item.id}>
            <Image src={item.image} alt={item.title} width={1200} height={750} sizes="(max-width: 700px) 100vw, 33vw" style={{width:"100%",height:"auto"}} />
            <div className="card-body"><strong>{item.title}</strong><p className="meta">참여형 편집 + 투표</p><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><VoteButton pollId={item.id} /><Link href={`/edit/${item.id}`}><button className="secondary">편집 참여</button></Link></div></div>
          </article>
        ))}
      </section>
    </main>
  );
}

function getSessionId() {
  const existing = sessionStorage.getItem("vg-session");
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem("vg-session", created);
  return created;
}

function VoteButton({ pollId }: { pollId: string }) {
  const [state, setState] = useState<"idle"|"saving"|"done"|"error">("idle");
  async function vote() {
    if (state === "saving" || state === "done") return;
    setState("saving");
    const response = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ pollId, option: "like", sessionId: getSessionId() }) });
    setState(response.ok ? "done" : "error");
  }
  return <><button disabled={state === "saving" || state === "done"} onClick={vote}>{state === "saving" ? "반영 중" : state === "done" ? "투표 완료" : "좋아요 투표"}</button>{state === "error" && <span className="meta">다시 시도해 주세요</span>}</>;
}
