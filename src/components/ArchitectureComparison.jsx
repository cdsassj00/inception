import React, { useState } from 'react';
import { Layers, Cpu, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function ArchitectureComparison() {
  const [selectedView, setSelectedView] = useState('blueprint');

  return (
    <section id="architecture" className="wb-section">
      {/* Section Narrative */}
      <div className="section-narrative">
        <div className="section-kicker font-mono text-blue">03 / ARCHITECTURAL COMPARISON</div>
        <h2 className="section-title">
          아키텍처 대조: 눈가리개 시야(AR) vs 독수리 시야(dLLM)
        </h2>
        <p className="section-subtitle">
          기존 GPT는 뒤에 올 단어를 볼 수 없도록 <strong>눈가리개를 찬 경주마</strong>처럼 앞만 보며 작문합니다. 
          반면 인셉션은 문장의 처음과 끝을 동시에 내려다보는 <strong>독수리 시야(양방향 어텐션)</strong>로 앞뒤 맥락을 통째로 엮어냅니다.
        </p>
      </div>

      {/* Flat Minimal Sub-Navigation */}
      <div className="flat-controls-bar">
        <div className="sample-selector-group">
          <button
            className={`flat-pill-btn ${selectedView === 'blueprint' ? 'active' : ''}`}
            onClick={() => setSelectedView('blueprint')}
          >
            <Layers size={13} />
            <span>어텐션 & 메모리 구조 블루프린트</span>
          </button>
          <button
            className={`flat-pill-btn ${selectedView === 'matrix' ? 'active' : ''}`}
            onClick={() => setSelectedView('matrix')}
          >
            <Cpu size={13} />
            <span>하드웨어 & 복잡도 5대 매트릭스</span>
          </button>
        </div>
      </div>

      {/* View 1: Blueprint */}
      {selectedView === 'blueprint' && (
        <div className="flat-blueprint-grid">
          {/* Left: AR Blueprint */}
          <div className="flat-blueprint-col ar-col">
            <div className="bp-header">
              <span className="bp-tag font-mono text-amber">🖨️ 기존 패러다임: AUTOREGRESSIVE</span>
              <h3 className="bp-title">삼각 인과 마스크 (Causal Mask)</h3>
              <p className="bp-desc text-secondary">
                미래의 토큰을 볼 수 없도록 오른쪽이 가려져 있어, 오직 앞선 토큰들만 보며 1개씩 예측합니다.
              </p>
            </div>

            {/* Matrix Visual */}
            <div className="flat-matrix-visual ar-matrix-bg">
              <div className="font-mono text-xs text-amber mb-2">▼ Causal Triangular Attention</div>
              <div className="matrix-cells-grid">
                <div className="m-cell active">t1</div>
                <div className="m-cell masked">∅</div>
                <div className="m-cell masked">∅</div>
                <div className="m-cell masked">∅</div>

                <div className="m-cell active">t1</div>
                <div className="m-cell active">t2</div>
                <div className="m-cell masked">∅</div>
                <div className="m-cell masked">∅</div>

                <div className="m-cell active">t1</div>
                <div className="m-cell active">t2</div>
                <div className="m-cell active">t3</div>
                <div className="m-cell masked">∅</div>

                <div className="m-cell active">t1</div>
                <div className="m-cell active">t2</div>
                <div className="m-cell active">t3</div>
                <div className="m-cell active">t4</div>
              </div>
              <p className="matrix-caption text-muted font-mono text-xs mt-2">
                * 1개 단어 생성 시마다 모델 가중치(수십 GB)를 VRAM에서 SRAM으로 매번 재로드 (Memory-Bound 병목)
              </p>
            </div>

            <div className="bp-verdict-line text-xs font-mono text-amber">
              ⚠️ 치명적 한계: O(N) 순차 지연 · GPU 연산 유닛(Tensor Core)의 80% 이상이 유휴 상태로 낭비됨
            </div>
          </div>

          {/* Right: Inception dLLM Blueprint */}
          <div className="flat-blueprint-col diff-col">
            <div className="bp-header">
              <span className="bp-tag font-mono text-emerald">🎨 인셉션 혁신: DISCRETE DIFFUSION</span>
              <h3 className="bp-title">완전 양방향 어텐션 (Full Bidirectional)</h3>
              <p className="bp-desc text-secondary">
                모든 토큰이 마스크 없이 서로를 360도로 참조하며, 문장 전체의 잡음을 동시에 걷어냅니다.
              </p>
            </div>

            {/* Matrix Visual */}
            <div className="flat-matrix-visual diff-matrix-bg">
              <div className="font-mono text-xs text-emerald mb-2">▼ Full Bidirectional Receptive Field</div>
              <div className="matrix-cells-grid">
                <div className="m-cell diff-active">t1</div>
                <div className="m-cell diff-active">t2</div>
                <div className="m-cell diff-active">t3</div>
                <div className="m-cell diff-active">t4</div>

                <div className="m-cell diff-active">t1</div>
                <div className="m-cell diff-active">t2</div>
                <div className="m-cell diff-active">t3</div>
                <div className="m-cell diff-active">t4</div>

                <div className="m-cell diff-active">t1</div>
                <div className="m-cell diff-active">t2</div>
                <div className="m-cell diff-active">t3</div>
                <div className="m-cell diff-active">t4</div>

                <div className="m-cell diff-active">t1</div>
                <div className="m-cell diff-active">t2</div>
                <div className="m-cell diff-active">t3</div>
                <div className="m-cell diff-active">t4</div>
              </div>
              <p className="matrix-caption text-muted font-mono text-xs mt-2">
                * 단 3~4번의 대규모 행렬 곱셈으로 수백 개 토큰을 일괄 연산 (Compute-Bound 고효율)
              </p>
            </div>

            <div className="bp-verdict-line text-xs font-mono text-emerald">
              ✨ 아키텍처 우위: O(1) 고정 스텝 · GPU 텐서 코어를 100% 포화시켜 극단적인 저지연 및 에너지 절감
            </div>
          </div>
        </div>
      )}

      {/* View 2: Engineering Matrix */}
      {selectedView === 'matrix' && (
        <div className="flat-table-wrapper">
          <table className="flat-eng-table">
            <thead>
              <tr>
                <th>비교 차원</th>
                <th className="th-amber">기존 자기회귀 LLM (AR)</th>
                <th className="th-emerald">인셉션 확산 LLM (dLLM)</th>
                <th>강의 설명 팁</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">시간 복잡도</td>
                <td className="font-mono text-amber">O(N) 순차 생성</td>
                <td className="font-mono text-emerald font-bold">O(1) 고정 스텝</td>
                <td className="text-secondary text-xs">글자 수가 늘어도 인셉션은 붓질 횟수가 고정되어 시간 불변</td>
              </tr>
              <tr>
                <td className="font-bold">하드웨어 병목</td>
                <td className="text-secondary">메모리 대역폭(Memory-Bound)</td>
                <td className="text-emerald font-bold">연산 집약(Compute-Bound)</td>
                <td className="text-secondary text-xs">GPU 텐서 코어를 최대로 활용하여 H100 가동 효율 극대화</td>
              </tr>
              <tr>
                <td className="font-bold">어텐션 수용장</td>
                <td className="text-secondary">인과 마스크 (과거 토큰만 조망)</td>
                <td className="text-emerald font-bold">완전 양방향 (전체 문맥 조망)</td>
                <td className="text-secondary text-xs">앞뒤를 모두 보며 교정하므로 뒤쪽 맥락과 앞쪽 맥락이 자연스러움</td>
              </tr>
              <tr>
                <td className="font-bold">KV 캐시 메모리</td>
                <td className="text-amber">토큰 길이에 비례해 무한 증가</td>
                <td className="text-emerald font-bold">KV 캐시 비대화 문제 없음</td>
                <td className="text-secondary text-xs">초장문 생성 시에도 VRAM 고갈 위험이 현저히 적음</td>
              </tr>
              <tr>
                <td className="font-bold">첫 토큰 반응 (TTFT)</td>
                <td className="text-secondary">단일 토큰은 빠르나 전체 응답 느림</td>
                <td className="text-emerald font-bold">전체 완성본이 400ms 내 일괄 전달</td>
                <td className="text-secondary text-xs">실시간 음성 AI, 에이전트 다단계 도구 호출에 최적화</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
