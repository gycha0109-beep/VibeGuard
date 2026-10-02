import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Synthetic AI-generated baseline</div>
        <h1>Pick. Edit. Vote.</h1>
        <p>이미지 콘텐츠를 보고 간단한 편집안에 참여한 뒤 투표하는 데모 서비스입니다.</p>
        <div className="notice"><strong>Portfolio baseline:</strong> 이 단계에는 의도적인 보안·무결성·안정성 결함이 포함되어 있습니다.</div>
        <Link href="/contents"><button>콘텐츠 보기</button></Link>
      </section>
    </main>
  );
}
