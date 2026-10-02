import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeGuard",
  description: "Synthetic Next.js + Supabase security hardening and stabilization portfolio."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <header>
          <Link href="/"><strong>VibeGuard</strong></Link>
          <nav><Link href="/contents">콘텐츠</Link><Link href="/login">로그인</Link><Link href="/admin">관리</Link></nav>
        </header>
        {children}
      </body>
    </html>
  );
}
