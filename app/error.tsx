"use client";

export default function ErrorPage({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <div className="eyebrow">Recovery boundary</div>
      <h1 style={{ fontSize: 44 }}>화면을 불러오지 못했습니다.</h1>
      <p className="meta">오류 세부정보는 사용자 화면에 노출하지 않습니다.</p>
      <button onClick={reset}>다시 시도</button>
    </main>
  );
}
