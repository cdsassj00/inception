import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Presentation, Sparkles, Cpu, Layers, Lightbulb } from 'lucide-react';

const DECK_SLIDES = [
  {
    index: "01 / 06",
    tag: "패러다임의 한계",
    title: "왜 자기회귀(AR) 언어 모델은 하드웨어 한계에 부딪혔는가?",
    subtitle: "Next-Token Prediction의 본질적 제약과 GPU 텐서 코어 유휴화",
    easySummary: "기존 AI(ChatGPT)는 타자기처럼 한 글자씩 순서대로 찍기 때문에, 아무리 비싼 최신 GPU를 수만 개 사다 꽂아도 글자마다 줄 서서 기다리는 병목을 피할 수 없습니다.",
    points: [
      {
        num: "01",
        title: "직렬 의존성 (Sequential Dependency)",
        desc: "N번째 단어를 생성하려면 반드시 1부터 N-1까지의 단어가 확정되어야 합니다. 시간 복잡도가 O(N)에 선형 속박됩니다."
      },
      {
        num: "02",
        title: "GPU 메모리 대역폭 병목 (Memory-Bound)",
        desc: "수천 개의 연산 코어가 단 1개의 토큰을 계산하기 위해 수십 GB의 모델 가중치를 매번 VRAM에서 읽어오며 대기합니다."
      },
      {
        num: "03",
        title: "KV 캐시의 기하급수적 팽창",
        desc: "문맥이 길어질수록 과거 토큰의 Key-Value 캐시가 GPU 메모리를 과도하게 점유하여 동시 처리량(Concurrency)이 급감합니다."
      }
    ],
    highlight: "아무리 빠른 GPU를 병렬로 투입해도, 수학적 구조상 직렬 대기 루프를 벗어날 수 없습니다."
  },
  {
    index: "02 / 06",
    tag: "새로운 패러다임",
    title: "이산 확산 언어 모델 (Discrete Diffusion dLLM)",
    subtitle: "전체 시퀀스를 동시에 생성하고 단 2~4회 스텝만에 역확산 복원",
    easySummary: "미드저니가 그림 전체를 흐릿하게 잡았다가 3번 만에 선명하게 그리듯, 인셉션은 문장 전체를 3번의 붓질로 동시에 완성하여 5~10배 빠릅니다.",
    points: [
      {
        num: "01",
        title: "전체 토큰 버퍼 동시 배치 (Parallel Seeding)",
        desc: "문장 길이만큼의 [MASK] 및 이산 노이즈 토큰을 한 번에 깔아두고 병렬 생성 작업을 시작합니다."
      },
      {
        num: "02",
        title: "완전 양방향 어텐션 (Full Bidirectional Receptive Field)",
        desc: "앞 단어뿐만 아니라 뒤에 올 단어와의 상호 연관성까지 동시에 고려하여 문장 전체의 조화를 한 번에 완성합니다."
      },
      {
        num: "03",
        title: "고정 스텝 역확산 (Fixed Iteration Denoising)",
        desc: "문장이 100단어든 1000단어든 단 2~4회의 신경망 포워드 패스만으로 깨끗한 텍스트를 병렬 복원합니다."
      }
    ],
    highlight: "Stable Diffusion이 이미지를 노이즈에서 한 번에 빚어내듯, 텍스트 전체를 병렬로 조각합니다."
  },
  {
    index: "03 / 06",
    tag: "핵심 기술 비교",
    title: "자기회귀(AR) vs 이산 확산(dLLM) 4대 기술 지표",
    subtitle: "개발자와 인프라 엔지니어가 반드시 알아야 할 구조적 차이",
    easySummary: "기존 AI는 뒤에 올 말을 가려놓고 앞만 보며 억지로 작문했지만, 인셉션은 문장 전체의 앞뒤를 한눈에 보며 고치기 때문에 속도와 문맥 정확도가 모두 뛰어납니다.",
    points: [
      {
        num: "01",
        title: "생성 지연 시간 (Latency)",
        desc: "AR: 토큰 수에 정비례하여 지연 증가 vs Diffusion: 문장 전체 단위 초고속 5~10배 가속"
      },
      {
        num: "02",
        title: "하드웨어 친화성 (Compute Efficiency)",
        desc: "AR: 메모리 대역폭 낭비 vs Diffusion: GPU 텐서 코어의 대규모 병렬 연산(Compute-bound) 100% 활용"
      },
      {
        num: "03",
        title: "코드 인필링 & 중간 수정 (Native FIM)",
        desc: "AR: 중간 삽입 시 복잡한 포맷 트릭 필요 vs Diffusion: 특정 위치만 마스킹하여 양방향 디노이징으로 완벽 보완"
      }
    ],
    highlight: "Copilot Arena에서 Inception Mercury 모델이 속도 1위, 품질 동급 최상위를 기록한 근거입니다."
  },
  {
    index: "04 / 06",
    tag: "Mercury 3 성능",
    title: "Mercury 3: 1M 컨텍스트와 지능의 결합",
    subtitle: "백만 토큰 문맥을 실시간으로 조망하는 차세대 플래그십",
    easySummary: "책 3권 분량(100만 토큰)의 거대한 코드나 문서를 한 번에 읽고, 커피 한 모금 마실 시간에 수만 줄의 답안을 즉시 뽑아냅니다.",
    points: [
      {
        num: "01",
        title: "1,000,000 (1M) 토큰 Context Window",
        desc: "대규모 코드베이스 전체, 장편 기술 문서 전체를 단일 프롬프트로 입력하여 질문 가능"
      },
      {
        num: "02",
        title: "131,072 토큰 출력 용량",
        desc: "수만 줄의 모노레포 코드 리팩토링이나 방대한 논문 수준의 긴 보고서도 단일 호출로 생성"
      },
      {
        num: "03",
        title: "4단계 Reasoning Effort (instant / low / medium / high)",
        desc: "초저지연 실시간 턴부터 깊은 단계별 논리 추론까지 워크플로우에 맞춰 자유롭게 선택"
      }
    ],
    highlight: "런칭 프로모션: 100만 입력 토큰당 단 $0.10, 출력 토큰당 $0.35로 극단적 비용 절감"
  },
  {
    index: "05 / 06",
    tag: "모델 생태계",
    title: "목적에 맞게 특화된 Inception 모델 제품군",
    subtitle: "채팅부터 음성, 코드 완성, 초저비용 의사결정까지",
    easySummary: "음성 챗봇(Mercury Voice), 코딩 비서(Mercury Edit), 0원 판단 엔진(Mercury Decide) 등 실시간 서비스에 꼭 필요한 맞춤형 라인업을 제공합니다.",
    points: [
      {
        num: "01",
        title: "Mercury Voice",
        desc: "LiveKit, Vapi, ElevenLabs와 연동되는 인간 수준의 실시간 음성 대화 특화 LLM"
      },
      {
        num: "02",
        title: "Mercury Edit 2",
        desc: "Cursor, Zed 등 차세대 IDE에서 인라인 자동완성(FIM) 및 다음 코드 수정 예측(Next-Edit) 수행"
      },
      {
        num: "03",
        title: "Mercury Decide",
        desc: "입력 토큰당 $0.02, 출력 토큰 비용 $0(무료)! 수천 건의 분류, 라우팅, 가드레일 판정을 초고속 수행"
      }
    ],
    highlight: "단순 챗봇을 넘어 실시간 자율 에이전트(Autonomous Agents) 시대를 위한 완전한 라인업"
  },
  {
    index: "06 / 06",
    tag: "강의 결론",
    title: "강의 요약 및 실무 적용 가이드라인",
    subtitle: "언제 Diffusion LLM을 도입해야 하는가?",
    easySummary: "기존 파이썬/자바스크립트 코드 수정 없이, 주소(baseURL)와 API 키만 바꾸면 기존 시스템에서 바로 5~10배 속도 향상을 누릴 수 있습니다.",
    points: [
      {
        num: "01",
        title: "도입 추천 1: 실시간 음성 봇 & 대화형 에이전트",
        desc: "발화 후 대기 시간(Latency)이 사용자 이탈을 좌우하는 서비스에서 극적인 반응성 개선"
      },
      {
        num: "02",
        title: "도입 추천 2: 다단계 도구 호출(Tool Calling) 에이전트",
        desc: "에이전트가 생각하고 도구를 호출하는 루프가 많아질수록 5~10배 속도 차이가 누적되어 극대화됨"
      },
      {
        num: "03",
        title: "기존 코드 100% 재사용",
        desc: "OpenAI SDK의 baseURL과 API 키만 변경하면 기존 파이프라인에서 즉시 전환 가능"
      }
    ],
    highlight: "Inception Mercury는 단순한 또 하나의 모델이 아닌, LLM 서빙의 새로운 기술 패러다임입니다."
  }
];

export default function LectureDeckModal({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentIdx(prev => Math.min(DECK_SLIDES.length - 1, prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIdx(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = DECK_SLIDES[currentIdx];

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div className="keynote-deck-card" onClick={e => e.stopPropagation()}>
        {/* Top Control Header */}
        <div className="keynote-deck-header card-header-bar">
          <div className="flex-row items-center gap-2">
            <Presentation size={15} className="text-emerald" />
            <span className="font-mono font-bold text-white">INCEPTION MERCURY KEYNOTE DECK</span>
            <span className="eng-badge eng-badge-emerald font-mono">{current.index}</span>
          </div>

          <div className="flex-row items-center gap-3">
            <span className="font-mono text-xs text-muted d-none-mobile">KEYBOARD: [←] [→] SLIDES / [ESC] EXIT</span>
            <button className="eng-btn eng-btn-outline eng-btn-xs" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 16:9 Editorial Slide Stage */}
        <div className="keynote-stage">
          <div className="keynote-slide-inner">
            <div className="slide-tag-line mb-2">
              <span className="eng-badge eng-badge-blue font-mono">{current.tag}</span>
            </div>

            <h2 className="slide-hero-title">{current.title}</h2>
            <p className="slide-hero-sub text-secondary font-mono mb-4">{current.subtitle}</p>

            <div className="bento-grid-3 slide-points-bento mb-3">
              {current.points.map((pt, i) => (
                <div key={i} className="slide-point-item bento-card p-3">
                  <div className="flex-row items-center gap-2 mb-2">
                    <span className="point-badge font-mono">{pt.num}</span>
                    <strong className="slide-pt-title text-sm">{pt.title}</strong>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{pt.desc}</p>
                </div>
              ))}
            </div>

            {/* Easy Analogy & Lecture Cue */}
            <div className="easy-guide-box mb-3" style={{ padding: '10px 14px', marginBottom: '12px' }}>
              <div className="easy-guide-icon-wrapper" style={{ padding: '4px' }}>
                <Lightbulb size={15} />
              </div>
              <div className="easy-guide-content">
                <div className="easy-guide-title" style={{ fontSize: '0.82rem', marginBottom: '2px' }}>
                  💡 비유로 끝내는 쉬운 핵심 요약
                </div>
                <p className="easy-guide-text" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                  {current.easySummary}
                </p>
              </div>
            </div>

            {/* Bottom Highlight Strip */}
            <div className="slide-takeaway-strip">
              <Sparkles size={16} className="text-emerald flex-shrink-0" />
              <span className="text-xs text-emerald font-mono">{current.highlight}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="keynote-deck-footer card-header-bar">
          <button
            className="eng-btn eng-btn-secondary eng-btn-xs font-mono"
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft size={14} /> PREV SLIDE
          </button>

          <div className="flex-row gap-1">
            {DECK_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`deck-dot ${currentIdx === i ? 'active' : ''}`}
                onClick={() => setCurrentIdx(i)}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="eng-btn eng-btn-primary eng-btn-xs font-mono"
            onClick={() => setCurrentIdx(prev => Math.min(DECK_SLIDES.length - 1, prev + 1))}
            disabled={currentIdx === DECK_SLIDES.length - 1}
          >
            NEXT SLIDE <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
