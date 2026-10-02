"use client";

import { useState } from "react";

export default function AdminPage() {
  const [result, setResult] = useState("서버 인증 전");
  async function load() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    setResult(await response.text());
  }
  return <main><span className="badge">Server-verified admin boundary</span><h1 style={{fontSize:44}}>관리자</h1><p>권한은 클라이언트 헤더가 아니라 서버에서 확인한 인증 사용자와 DB role에서 파생됩니다.</p><button onClick={load}>관리 범위 확인</button><pre>{result}</pre></main>;
}
