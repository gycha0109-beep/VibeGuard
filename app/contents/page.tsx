"use client";

import { useEffect, useState } from "react";

const seed = [
  { id: "11111111-1111-1111-1111-111111111111", title: "City after rain", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80" },
  { id: "22222222-2222-2222-2222-222222222222", title: "Warm desk", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80" },
  { id: "33333333-3333-3333-3333-333333333333", title: "Quiet coast", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" }
];

export default function ContentsPage() {
  const [items, setItems] = useState(seed);
  const [refreshes, setRefreshes] = useState(0);

  useEffect(() => {
    // PERF-001 baseline: duplicate-style client work and full-list state replacement.
    fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event_name: "content_list_viewed", email: "demo@example.com", refreshes }) }).catch(() => undefined);
    setItems([...seed]);
  }, [refreshes]);

  return (
    <main>
      <div className="eyebrow">Community board</div>
      <h1 style={{fontSize:44}}>오늘의 이미지</h1>
      <p className="meta">baseline은 일반 img 태그와 큰 원격 이미지를 그대로 사용합니다.</p>
      <button className="secondary" onClick={() => setRefreshes((v) => v + 1)}>새로고침</button>
      <section className="grid" style={{marginTop:20}}>
        {items.map((item) => (
          <article className="card" key={item.id}>
            {/* PERF-002 baseline: next/image 미사용 */}
            <img src={item.image} alt={item.title} />
            <div className="card-body"><strong>{item.title}</strong><p className="meta">참여형 편집 + 투표</p><VoteButton pollId={item.id} /></div>
          </article>
        ))}
      </section>
    </main>
  );
}

function VoteButton({ pollId }: { pollId: string }) {
  const [message, setMessage] = useState("");
  async function vote() {
    const response = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pollId, option: "like", userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }) });
    setMessage(response.ok ? "투표 완료" : "오류");
  }
  return <><button onClick={vote}>좋아요 투표</button>{message && <span className="meta" style={{marginLeft:8}}>{message}</span>}</>;
}
