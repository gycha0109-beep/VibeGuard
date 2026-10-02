"use client";

import { useState } from "react";

export default function AdminPage() {
  const [result, setResult] = useState("아직 조회하지 않음");
  async function load() {
    const response = await fetch("/api/admin/users", { headers: { "x-role": "admin" } });
    setResult(await response.text());
  }
  return <main><span className="badge">Baseline admin</span><h1 style={{fontSize:44}}>관리자</h1><p>SEC-003: 클라이언트가 보낸 x-role 헤더를 신뢰하는 의도적 결함.</p><button onClick={load}>사용자 조회</button><pre>{result}</pre></main>;
}
