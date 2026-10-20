import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

const SENTENCES = [
  {
    id: 'korean-ai',
    title: '한국어 AI 원리 설명',
    tokens: [
      { id: 0, word: "이산", stepResolved: 1, p0: 0.12, p1: 0.78, p2: 0.94, p3: 0.99 },
      { id: 1, word: "확산", stepResolved: 1, p0: 0.15, p1: 0.85, p2: 0.96, p3: 0.99 },
      { id: 2, word: "모델은", stepResolved: 2, p0: 0.08, p1: 0.45, p2: 0.91, p3: 0.99 },
      { id: 3, word: "모든", stepResolved: 2, p0: 0.10, p1: 0.42, p2: 0.88, p3: 0.99 },
      { id: 4, word: "토큰을", stepResolved: 2, p0: 0.09, p1: 0.50, p2: 0.92, p3: 0.99 },
      { id: 5, word: "병렬로", stepResolved: 1, p0: 0.14, p1: 0.82, p2: 0.95, p3: 0.99 },
      { id: 6, word: "동시", stepResolved: 2, p0: 0.07, p1: 0.48, p2: 0.89, p3: 0.99 },
      { id: 7, word: "생성하여", stepResolved: 1, p0: 0.18, p1: 0.88, p2: 0.97, p3: 0.99 },
      { id: 8, word: "기존의", stepResolved: 3, p0: 0.05, p1: 0.32, p2: 0.74, p3: 0.99 },
      { id: 9, word: "순차적", stepResolved: 2, p0: 0.11, p1: 0.60, p2: 0.90, p3: 0.99 },
      { id: 10, word: "지연시간을", stepResolved: 1, p0: 0.16, p1: 0.79, p2: 0.93, p3: 0.99 },
      { id: 11, word: "극적으로", stepResolved: 3, p0: 0.04, p1: 0.28, p2: 0.68, p3: 0.98 },
      { id: 12, word: "단축합니다.", stepResolved: 1, p0: 0.20, p1: 0.84, p2: 0.95, p3: 0.99 }
    ]
  },
  {
    id: 'code-python',
    title: 'Python 함수 구현',
    tokens: [
      { id: 0, word: "def", stepResolved: 1, p0: 0.25, p1: 0.90, p2: 0.98, p3: 0.99 },
      { id: 1, word: "parallel_denoise", stepResolved: 1, p0: 0.18, p1: 0.82, p2: 0.95, p3: 0.99 },
      { id: 2, word: "(tokens,", stepResolved: 2, p0: 0.09, p1: 0.52, p2: 0.91, p3: 0.99 },
      { id: 3, word: "steps=3):", stepResolved: 2, p0: 0.10, p1: 0.48, p2: 0.89, p3: 0.99 },
      { id: 4, word: "\n    return", stepResolved: 1, p0: 0.22, p1: 0.86, p2: 0.96, p3: 0.99 },
      { id: 5, word: "model.forward", stepResolved: 1, p0: 0.15, p1: 0.80, p2: 0.94, p3: 0.99 },
      { id: 6, word: "(bidirectional=True)", stepResolved: 2, p0: 0.08, p1: 0.55, p2: 0.92, p3: 0.99 }
    ]
  }
];

const GLITCH_SET = ['§', '#', '@', '&', '░', '▒', '▓', '※', '?', '%', 'ø'];

function getMaskedDisplay(word, progress, seed) {
  if (progress >= 0.95) return word;
  if (progress <= 0.05) {
    return word.split('').map((_, i) => GLITCH_SET[(seed + i * 3) % GLITCH_SET.length]).join('');
  }
  return word.split('').map((c, i) => {
    const r = ((seed * 7 + i * 13) % 100) / 100;
    if (r < progress) return c;
    return GLITCH_SET[(seed + i * 5) % GLITCH_SET.length];
  }).join('');
}

export default function DiffusionScrubber() {
  const [activeSentence, setActiveSentence] = useState(SENTENCES[0]);
  const [stepIndex, setStepIndex] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedToken, setSelectedToken] = useState(SENTENCES[0].tokens[1]);

  const playTimer = useRef(null);

  const stepsMeta = [
    { 
      label: "Step 0 (백지)", 
      title: "Step 0: 스케치 전 백지 잡음", 
      desc: "문장의 길이만큼 [잡음 토큰]을 캔버스에 쫙 깔아둔 상태입니다." 
    },
    { 
      label: "Step 1 (1차 붓질)", 
      title: "Step 1: 1번째 붓질 (핵심 뼈대 윤곽)", 
      desc: "주어와 서술어 등 문장의 핵심 기둥이 되는 단어들을 먼저 높은 확률로 복원합니다." 
    },
    { 
      label: "Step 2 (2차 붓질)", 
      title: "Step 2: 2번째 붓질 (앞뒤 문맥 정밀 수정)", 
      desc: "앞뒤 단어를 동시에 보며 어색한 조사와 수식어들을 알맞게 교체합니다." 
    },
    { 
      label: "Step 3 (완성)", 
      title: "Step 3: 3번째 붓질 (최종 완성 문장)", 
      desc: "잡음이 완전히 걷히고 선명한 전체 문장이 단숨에 완성됩니다." 
    }
  ];

  const currentMeta = stepsMeta[stepIndex];

  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setStepIndex(prev => (prev >= 3 ? 0 : prev + 1));
      }, 1200);
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying]);

  return (
    <section id="scrubber" className="wb-section">
      {/* Section Header */}
      <div className="section-narrative">
        <div className="section-kicker font-mono text-emerald">02 / INTERACTIVE DENOISING LAB</div>
        <h2 className="section-title">
          디노이징 스크러버: 3단계 붓질로 문장이 완성되는 과정
        </h2>
        <p className="section-subtitle">
          미드저니가 노이즈에서 점차 선명한 그림을 뽑아내듯, 
          인셉션은 <strong>알 수 없는 글자 잡음에서 단 3번의 붓질로 완벽한 문장</strong>을 뽑아냅니다. 
          슬라이더를 움직여 각 단계별 단어 복원 확률을 체험해보세요.
        </p>
      </div>

      {/* Flat Minimal Controls Bar */}
      <div className="flat-controls-bar">
        <div className="sample-selector-group">
          <span className="font-mono text-xs text-muted">샘플:</span>
          {SENTENCES.map(s => (
            <button
              key={s.id}
              className={`flat-pill-btn ${activeSentence.id === s.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSentence(s);
                setSelectedToken(s.tokens[0]);
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="action-buttons-group">
          <button
            className="eng-btn eng-btn-secondary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? '일시정지' : '자동 시연'}</span>
          </button>
          <button
            className="eng-btn eng-btn-secondary"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(0);
            }}
          >
            <RotateCcw size={14} />
            <span>처음으로</span>
          </button>
        </div>
      </div>

      {/* Sleek Step Timeline */}
      <div className="flat-timeline-strip">
        <div className="timeline-steps-row">
          {stepsMeta.map((sm, idx) => (
            <button
              key={idx}
              className={`timeline-step-btn ${stepIndex === idx ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(idx);
              }}
            >
              <span className="step-num font-mono">{idx}</span>
              <span className="step-label">{sm.label}</span>
            </button>
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={stepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setStepIndex(Number(e.target.value));
          }}
          className="flat-range-slider"
        />

        <div className="timeline-caption font-mono">
          <span className="caption-badge text-emerald">{currentMeta.title}</span>
          <span className="caption-desc text-secondary">{currentMeta.desc}</span>
        </div>
      </div>

      {/* Clean 2-Pane Canvas (No nested boxes) */}
      <div className="flat-scrubber-layout">
        {/* Left: Sentence Flow Canvas */}
        <div className="scrubber-flow-pane">
          <div className="flow-kicker font-mono text-muted text-xs">
            <span>SEQUENCE CANVAS (단어를 클릭하여 세부 확률 확인)</span>
            <span className="text-secondary">총 {activeSentence.tokens.length}개 토큰 동시 생성</span>
          </div>

          <div className="flow-tokens-flow">
            {activeSentence.tokens.map((tk) => {
              const conf = tk[`p${stepIndex}`];
              const isResolved = stepIndex >= tk.stepResolved;
              const displayText = getMaskedDisplay(tk.word, conf, tk.id);
              const isSelected = selectedToken?.id === tk.id;

              return (
                <button
                  key={tk.id}
                  className={`flat-token-item ${isResolved ? 'resolved' : conf > 0.4 ? 'partial' : 'noise'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedToken(tk)}
                >
                  <span className="token-str">{displayText}</span>
                  <span className="token-rate font-mono">{(conf * 100).toFixed(0)}%</span>
                </button>
              );
            })}
          </div>

          <div className="flow-legend-line font-mono text-xs text-muted">
            <span className="legend-dot resolved"></span> 확정 (완전 복원)
            <span className="legend-dot partial"></span> 부분 정제 중
            <span className="legend-dot noise"></span> 잡음 (미정)
          </div>
        </div>

        {/* Right: Inspector Details (Clean Minimal Aside) */}
        {selectedToken && (
          <aside className="scrubber-inspector-aside">
            <div className="inspector-kicker font-mono text-xs text-muted">TOKEN PROBABILITY INSPECTOR</div>
            <div className="inspector-word-display">
              <span className="ins-word font-bold">{selectedToken.word}</span>
              <span className="ins-badge font-mono text-xs">
                Step {selectedToken.stepResolved}에서 확정됨
              </span>
            </div>

            <div className="inspector-prob-bars">
              <div className="font-mono text-xs text-muted mb-2">단계별 복원 신뢰도:</div>
              {[0, 1, 2, 3].map((step) => {
                const p = selectedToken[`p${step}`];
                const isCurrent = stepIndex === step;
                return (
                  <div key={step} className={`ins-bar-row ${isCurrent ? 'current' : ''}`}>
                    <span className="font-mono text-xs">Step {step}</span>
                    <div className="ins-bar-track">
                      <div 
                        className={`ins-bar-fill ${p > 0.8 ? 'fill-emerald' : 'fill-amber'}`}
                        style={{ width: `${p * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-right">{(p * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>

            <p className="inspector-footnote text-secondary text-xs">
              💡 인셉션은 양방향 어텐션(Bidirectional Attention)으로 앞뒤 문맥을 동시에 보고 복원 확률을 끌어올립니다.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
