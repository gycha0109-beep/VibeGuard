import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">AI-generated app hardening case study</div>
        <h1>VibeGuard</h1>
        <p>빠르게 제작된 이미지 참여·투표 MVP를 보안, 데이터 무결성, 회귀 검증 관점에서 안정화한 synthetic 포트폴리오입니다.</p>
        <div className="notice"><strong>Evidence first:</strong> baseline 취약 상태는 <code>baseline-ai-generated</code> ref에 보존하고, main은 remediation과 자동 검증을 누적합니다.</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Link href="/contents"><button>Hardened demo 보기</button></Link>
          <Link href="/login"><button className="secondary">로그인</button></Link>
        </div>
      </section>
    </main>
  );
}
