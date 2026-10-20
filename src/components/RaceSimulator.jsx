import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Clock, Zap, ArrowRight } from 'lucide-react';

const BENCH_SAMPLES = [
  {
    id: 1,
    label: "1. AI 확산 모델 원리",
    text: "이산 확산 모델(Discrete Diffusion LLM)은 모든 토큰을 병렬로 생성하여 전통적인 순차 생성의 속도 한계를 혁신적으로 극복합니다.",
    tokenCount: 22
  },
  {
    id: 2,
    label: "2. 양자 컴퓨팅 알고리즘",
    text: "양자 컴퓨팅은 중첩과 얽힘이라는 양자역학 원리를 활용하여 기존 컴퓨터로는 풀기 힘든 복잡한 최적화 문제를 초고속으로 계산합니다.",
    tokenCount: 24
  },
  {
    id: 3,
    label: "3. 실시간 AI 에이전트",
    text: "인공지능 에이전트 시스템에서 지연 시간 단축은 실시간 음성 상호작용과 자율적 다단계 도구 호출 루프의 성공을 결정짓는 핵심 요소입니다.",
    tokenCount: 26
  }
];

const NOISE_POOL = ['▒', '░', '▓', '§', '¶', 'ø', '¥', '#', '@', '&'];

function makeNoiseText(str, ratio) {
  return str.split('').map(c => {
    if (c === ' ') return ' ';
    if (Math.random() < ratio) {
      return NOISE_POOL[Math.floor(Math.random() * NOISE_POOL.length)];
    }
    return c;
  }).join('');
}

export default function RaceSimulator() {
  const [selectedSample, setSelectedSample] = useState(BENCH_SAMPLES[0]);
  const [isRacing, setIsRacing] = useState(false);

  // Autoregressive track
  const [arWords, setArWords] = useState('');
  const [arTime, setArTime] = useState(0);
  const [arFinished, setArFinished] = useState(false);

  // Diffusion track
  const [diffText, setDiffText] = useState('');
  const [diffStep, setDiffStep] = useState(0);
  const [diffTime, setDiffTime] = useState(0);
  const [diffFinished, setDiffFinished] = useState(false);

  const arTimer = useRef(null);

  const startRace = () => {
    setIsRacing(true);
    setArWords('');
    setArTime(0);
    setArFinished(false);
    setDiffText('');
    setDiffStep(0);
    setDiffTime(0);
    setDiffFinished(false);

    const full = selectedSample.text;
    const tokens = full.split(' ');
    const startTime = performance.now();

    // 1. Inception Diffusion Track (3 rapid parallel steps: 70ms, 210ms, 380ms)
    setTimeout(() => {
      setDiffText(makeNoiseText(full, 0.90));
      setDiffStep(1);
    }, 70);

    setTimeout(() => {
      setDiffText(makeNoiseText(full, 0.40));
      setDiffStep(2);
    }, 220);

    setTimeout(() => {
      setDiffText(full);
      setDiffStep(3);
      setDiffFinished(true);
      setDiffTime(Math.round(performance.now() - startTime));
    }, 390);

    // 2. Autoregressive Track (Sequential token delivery at ~115ms/token)
    let tokenIndex = 0;
    arTimer.current = setInterval(() => {
      if (tokenIndex < tokens.length) {
        tokenIndex++;
        setArWords(tokens.slice(0, tokenIndex).join(' '));
        setArTime(Math.round(performance.now() - startTime));
      } else {
        clearInterval(arTimer.current);
        setArFinished(true);
        setArTime(Math.round(performance.now() - startTime));
        setIsRacing(false);
      }
    }, 115);
  };

  const resetRace = () => {
    if (arTimer.current) clearInterval(arTimer.current);
    setIsRacing(false);
    setArWords('');
    setArTime(0);
    setArFinished(false);
    setDiffText('');
    setDiffStep(0);
    setDiffTime(0);
    setDiffFinished(false);
  };

  useEffect(() => {
    return () => {
      if (arTimer.current) clearInterval(arTimer.current);
    };
  }, []);

  const speedMultiplier = diffTime > 0 && arTime > 0 ? (arTime / diffTime).toFixed(1) : '5.4';

  return (
    <section id="race" className="wb-section">
      {/* Clean Editorial Section Header (No Clutter) */}
      <div className="section-narrative">
        <div className="section-kicker font-mono text-emerald">02 / 속도 레이스</div>
        <h2 className="section-title">
          속도 레이스: 타자기 vs 화가, 누가 먼저 끝낼까?
        </h2>
        <p className="section-subtitle">
          기존 AI는 한 글자 쓸 때마다 한 번씩 생각해야 해서 글이 길수록 오래 걸려요.
          인셉션은 문장 전체를 한꺼번에 그려서 <strong>붓질 3번이면 끝</strong>납니다. 버튼을 눌러 직접 확인해보세요.
        </p>
      </div>

      {/* Flat Minimal Controls Strip (No heavy card box) */}
      <div className="flat-controls-bar">
        <div className="sample-selector-group">
          <span className="font-mono text-xs text-muted">예제 문장:</span>
          {BENCH_SAMPLES.map(s => (
            <button
              key={s.id}
              className={`flat-pill-btn ${selectedSample.id === s.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedSample(s);
                resetRace();
              }}
              disabled={isRacing}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="action-buttons-group">
          <button
            className="eng-btn eng-btn-primary"
            onClick={startRace}
            disabled={isRacing}
          >
            <Play size={15} />
            <span>동시 레이스 시작</span>
          </button>
          <button
            className="eng-btn eng-btn-secondary"
            onClick={resetRace}
            disabled={isRacing}
          >
            <RotateCcw size={15} />
            <span>리셋</span>
          </button>
        </div>
      </div>

      {/* Clean Split Track Arena (Borderless, High-contrast, Editorial) */}
      <div className="flat-arena-split">
        {/* Track 1: AR */}
        <div className={`flat-track-col ar-track ${arFinished ? 'finished' : ''}`}>
          <div className="track-col-header">
            <div>
              <div className="track-model-name text-amber font-mono">🖨️ 기존 AI (타자기 방식)</div>
              <div className="track-model-meta font-mono">한 글자씩 차례로 · 글자 수만큼 기다림</div>
            </div>
            <div className="track-live-timer font-mono text-amber">
              <Clock size={14} />
              <span>{arTime} ms</span>
            </div>
          </div>

          <div className="track-progress-line">
            <div 
              className="track-progress-fill ar-fill"
              style={{ width: `${arWords ? (arWords.length / selectedSample.text.length) * 100 : 0}%` }}
            />
          </div>

          <div className="track-text-canvas">
            {arWords ? (
              <p className="live-typing-text">
                {arWords}
                {!arFinished && <span className="ar-cursor">▌</span>}
              </p>
            ) : (
              <p className="track-placeholder text-muted">
                [동시 레이스 시작]을 누르면 한 글자씩 순차적으로 찍혀 나옵니다.
              </p>
            )}
          </div>

          <div className="track-col-footer font-mono text-xs text-muted">
            <span>상태: {arFinished ? '✅ 완료' : isRacing ? '한 글자씩 찍는 중...' : '대기'}</span>
            <span>생각 횟수: {selectedSample.tokenCount}번</span>
          </div>
        </div>

        {/* Track 2: Inception dLLM */}
        <div className={`flat-track-col diff-track ${diffFinished ? 'finished' : ''}`}>
          <div className="track-col-header">
            <div>
              <div className="track-model-name text-emerald font-mono">🎨 인셉션 (화가 방식)</div>
              <div className="track-model-meta font-mono">문장 전체를 동시에 · 붓질 3번이면 완성</div>
            </div>
            <div className="track-live-timer font-mono text-emerald">
              <Clock size={14} />
              <span>{diffTime} ms</span>
            </div>
          </div>

          <div className="track-progress-line">
            <div 
              className="track-progress-fill diff-fill"
              style={{ width: `${(diffStep / 3) * 100}%` }}
            />
          </div>

          <div className="track-text-canvas">
            {diffText ? (
              <div>
                <p className={`live-typing-text ${diffFinished ? 'clean-font' : 'glitch-font text-emerald'}`}>
                  {diffText}
                </p>
                {diffStep > 0 && (
                  <span className="flat-step-badge font-mono">
                    {diffFinished ? '✨ Step 3/3 완성' : `Step ${diffStep}/3 붓질 중...`}
                  </span>
                )}
              </div>
            ) : (
              <p className="track-placeholder text-muted">
                [동시 레이스 시작]을 누르면 전체 문장이 3번의 붓질로 단숨에 선명해집니다.
              </p>
            )}
          </div>

          <div className="track-col-footer font-mono text-xs text-muted">
            <span>상태: {diffFinished ? '⚡ 완성!' : isRacing ? '붓질하는 중...' : '대기'}</span>
            <span className="text-emerald">생각 횟수: 딱 3번</span>
          </div>
        </div>
      </div>

      {/* Result Stat Banner (Clean Minimal Line, Not heavy box) */}
      {(diffFinished || arFinished) && (
        <div className="flat-result-banner">
          <div className="result-headline">
            <Zap size={18} className="text-emerald" />
            <span>
              인셉션 Mercury-3가 <strong>{speedMultiplier}배</strong> 더 빠르게 전체 문장을 완성했습니다.
            </span>
          </div>
          <div className="result-meta-stats font-mono text-xs">
            <span>인셉션: {diffTime}ms</span>
            <span className="meta-sep">/</span>
            <span>기존 GPT: {arTime || '...'}ms</span>
            <span className="meta-sep">/</span>
            <span className="text-emerald font-bold">대기시간 {(arTime > 0 && diffTime > 0 ? (arTime - diffTime) : 0)}ms 단축</span>
          </div>
        </div>
      )}
    </section>
  );
}
