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
        <div className="section-kicker font-mono text-emerald">01 / SPEED BENCHMARK ARENA</div>
        <h2 className="section-title">
          속도 레이스: 순차 타자기 vs 3스텝 화가
        </h2>
        <p className="section-subtitle">
          기존 GPT는 1글자마다 1번씩 계산해야 하므로 단어가 많을수록 시간이 비례해서 늘어납니다. 
          반면 인셉션은 문장 전체를 펼쳐놓고 <strong>단 3번의 붓질(병렬 디노이징)</strong>로 끝냅니다.
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
              <div className="track-model-name text-amber font-mono">🖨️ 기존 GPT (자기회귀 AR)</div>
              <div className="track-model-meta font-mono">순차 생성 $O(N)$ · 글자 수만큼 시간 증가</div>
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
            <span>상태: {arFinished ? '✅ 완료' : isRacing ? '글자별 순차 대기 중...' : '대기'}</span>
            <span>연산: {selectedSample.tokenCount}회 순차 호출</span>
          </div>
        </div>

        {/* Track 2: Inception dLLM */}
        <div className={`flat-track-col diff-track ${diffFinished ? 'finished' : ''}`}>
          <div className="track-col-header">
            <div>
              <div className="track-model-name text-emerald font-mono">🎨 인셉션 Mercury-3 (확산 dLLM)</div>
              <div className="track-model-meta font-mono">병렬 디노이징 $O(1)$ · 고정 3스텝 번개 생성</div>
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
            <span>상태: {diffFinished ? '⚡ 3스텝 초고속 완료' : isRacing ? '병렬 디노이징 중...' : '대기'}</span>
            <span className="text-emerald">연산: 단 3단계 고정</span>
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
