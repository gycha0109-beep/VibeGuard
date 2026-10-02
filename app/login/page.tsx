"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? "로그인에 실패했습니다." : "로그인되었습니다.");
  }
  return <main><div className="eyebrow">Auth</div><h1 style={{fontSize:44}}>로그인</h1><form onSubmit={submit} style={{display:"grid",gap:12,maxWidth:420}}><input name="email" type="email" required placeholder="email" style={{padding:12}}/><input name="password" type="password" required minLength={8} placeholder="password" style={{padding:12}}/><button type="submit">로그인</button></form>{message && <p>{message}</p>}</main>;
}
