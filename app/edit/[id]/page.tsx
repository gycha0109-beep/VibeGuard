"use client";

import { use, useMemo, useState } from "react";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caption, setCaption] = useState("오늘의 한 줄");
  const preview = useMemo(() => caption.trim().slice(0, 60), [caption]);

  async function track(name: "edit_started" | "edit_completed") {
    const sessionId = sessionStorage.getItem("vg-session") ?? crypto.randomUUID();
    sessionStorage.setItem("vg-session", sessionId);
    await fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event_name: name, session_id: sessionId, content_id: id, dedupe_key: `${name}:${id}:${sessionId}`, properties: { caption_length: caption.length } }) });
  }

  return <main onPointerEnter={() => void track("edit_started")}><div className="eyebrow">Participation editor</div><h1 style={{fontSize:44}}>캡션 편집</h1><p className="meta">이미지 원본을 변형하지 않는 synthetic 참여 기능입니다.</p><label>캡션<input value={caption} maxLength={60} onChange={(e) => setCaption(e.target.value)} style={{display:"block",marginTop:8,padding:12,width:"100%",maxWidth:520}} /></label><div className="card" style={{marginTop:20,maxWidth:520}}><div className="card-body"><strong>미리보기</strong><p>{preview || "(비어 있음)"}</p></div></div><button style={{marginTop:16}} onClick={() => void track("edit_completed")}>참여 완료</button></main>;
}
