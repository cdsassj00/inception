import React from 'react';
import { Sparkles, ArrowRight, Zap, BookOpen, Coins } from 'lucide-react';

export default function Hero({ activeTab, onSelectTab }) {
  return (
    <div className="editorial-hero">
      {/* Top pill badge */}
      <div className="hero-pill-tag">
        <span className="pill-dot"></span>
        <span className="pill-text font-mono">NEXT-GEN LLM ARCHITECTURE</span>
        <span className="pill-divider">·</span>
        <span className="pill-sub">이산 확산(dLLM) vs 자기회귀(AR)</span>
      </div>

      {/* Main Clean Headline */}
      <h1 className="hero-editorial-title">
        한 글자씩 찍어내는 <span className="title-strike">타자기</span>에서,<br />
        단 3번의 붓질로 끝내는 <span className="title-highlight">초고속 화가</span>로.
      </h1>

      {/* Natural Lead Description (No clunky box!) */}
      <p className="hero-editorial-lead">
        기존 ChatGPT나 Claude는 첫 단어가 나와야 다음 단어를 계산하는 <strong>‘순차 타자기’</strong>였습니다.<br className="hidden-mobile" />
        인셉션(Mercury-3)은 문장 전체의 밑그림을 먼저 펼쳐두고 <strong>단 3번의 붓질(병렬 디노이징)</strong>로 한 번에 완성합니다.
      </p>

      {/* Sleek Inline Contrast (No heavy boxes, just elegant comparison) */}
      <div className="hero-contrast-strip">
        <div className="contrast-column ar-col">
          <div className="contrast-kicker font-mono">기존 LLM (GPT · Claude · LLaMA)</div>
          <div className="contrast-core">
            <span className="contrast-icon">🖨️</span>
            <div>
              <div className="contrast-name">한 글자씩 기다리는 타자기</div>
              <div className="contrast-desc">1,000자 답변을 쓰려면 1,000번의 순차 연산 필요</div>
            </div>
          </div>
        </div>

        <div className="contrast-divider">
          <ArrowRight size={18} className="text-muted" />
        </div>

        <div className="contrast-column diff-col">
          <div className="contrast-kicker font-mono text-emerald">인셉션 (Mercury-3 dLLM)</div>
          <div className="contrast-core">
            <span className="contrast-icon">🎨</span>
            <div>
              <div className="contrast-name text-emerald">밑그림 후 3번 붓질로 완성</div>
              <div className="contrast-desc">전체 토큰 동시 생성으로 <strong>5~10배 압도적 가속</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Stat Numbers (Flat, Borderless) */}
      <div className="hero-flat-stats font-mono">
        <div className="flat-stat">
          <div className="flat-stat-num text-emerald">5~10x</div>
          <div className="flat-stat-label">초고속 생성 속도 (초당 320단어)</div>
        </div>
        <div className="flat-stat-sep"></div>
        <div className="flat-stat">
          <div className="flat-stat-num text-blue">1,000,000</div>
          <div className="flat-stat-label">컨텍스트 윈도우 (책 3권 분량)</div>
        </div>
        <div className="flat-stat-sep"></div>
        <div className="flat-stat">
          <div className="flat-stat-num text-purple">$0.10</div>
          <div className="flat-stat-label">100만 입력 토큰당 (기존 1/10 수준)</div>
        </div>
      </div>
    </div>
  );
}
