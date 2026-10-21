import React from 'react';

export default function Hero() {
  return (
    <div className="editorial-hero">
      {/* Top pill badge */}
      <div className="hero-pill-tag">
        <span className="pill-dot"></span>
        <span className="pill-text font-mono">INCEPTION MERCURY</span>
        <span className="pill-divider">·</span>
        <span className="pill-sub">AI가 글을 쓰는 완전히 새로운 방법</span>
      </div>

      {/* Main Clean Headline */}
      <h1 className="hero-editorial-title">
        한 글자씩 찍는 <span className="title-strike">타자기</span>에서,<br />
        붓질 3번으로 끝내는 <span className="title-highlight">화가</span>로.
      </h1>

      {/* One-line plain lead */}
      <p className="hero-editorial-lead">
        ChatGPT 같은 기존 AI는 한 글자 쓰고 → 생각하고 → 또 한 글자 쓰는 방식이라 답이 길수록 오래 걸려요.
        인셉션은 <strong>문장 전체를 한꺼번에 그려내서 5~10배 빠릅니다.</strong> 아래에서 직접 질문해보세요.
      </p>

      {/* Minimal Stat Numbers (Flat, Borderless) */}
      <div className="hero-flat-stats font-mono">
        <div className="flat-stat">
          <div className="flat-stat-num text-emerald">5~10배</div>
          <div className="flat-stat-label">더 빠른 답변 속도</div>
        </div>
        <div className="flat-stat-sep"></div>
        <div className="flat-stat">
          <div className="flat-stat-num text-blue">책 3권</div>
          <div className="flat-stat-label">한 번에 기억하는 분량 (100만 토큰)</div>
        </div>
        <div className="flat-stat-sep"></div>
        <div className="flat-stat">
          <div className="flat-stat-num text-purple">1/10</div>
          <div className="flat-stat-label">기존 대비 사용 비용</div>
        </div>
      </div>
    </div>
  );
}
