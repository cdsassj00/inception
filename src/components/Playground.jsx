import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Copy, Check, AlertCircle, Clock, Zap, FastForward } from 'lucide-react';

const WORKBENCH_PRESETS = [
  {
    title: "인셉션이 빠른 이유",
    prompt: "인셉션의 확산 방식 AI가 기존 AI보다 왜 5배 이상 빠른지, 일상적인 비유를 들어 쉽게 설명해줘."
  },
  {
    title: "타자기 vs 화가 비유",
    prompt: "기존 AI를 '한 글자씩 찍는 타자기', 확산 AI를 '밑그림부터 그리는 화가'에 비유해서 초등학생도 이해할 수 있게 설명해줘."
  },
  {
    title: "파이썬 정렬 코드",
    prompt: "파이썬으로 리스트를 정렬하는 간단한 함수를 작성하고, 각 줄이 무슨 일을 하는지 주석으로 쉽게 설명해줘."
  },
  {
    title: "양자역학 2줄 요약",
    prompt: "양자역학의 중첩과 얽힘 개념을 비유를 들어 누구나 이해할 수 있게 2줄로 요약해줘."
  }
];

// Typical autoregressive chat LLM feels like ~80 chars/sec to the reader
const AR_SIM_CHARS_PER_SEC = 80;

export default function Playground({ apiKey }) {
  const [prompt, setPrompt] = useState(WORKBENCH_PRESETS[0].prompt);
  const [model, setModel] = useState('mercury-3');
  const [streamMode, setStreamMode] = useState('diffusing');
  const [reasoningEffort, setReasoningEffort] = useState('low');
  const [maxTokens, setMaxTokens] = useState(1024);
  const [activeTab, setActiveTab] = useState('rendered');

  const [isLoading, setIsLoading] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [rawChunks, setRawChunks] = useState([]);
  const [denoiseSteps, setDenoiseSteps] = useState([]);
  const [activeStepView, setActiveStepView] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [metrics, setMetrics] = useState({
    timeMs: 0,
    ttftMs: 0,
    promptTokens: 0,
    completionTokens: 0,
    reasoningTokens: 0,
    tps: 0
  });

  const abortRef = useRef(null);

  // "What if the same answer came from a classic one-token-at-a-time LLM?" replay
  const [arSim, setArSim] = useState({ status: 'idle', text: '', fullText: '', timeMs: 0 });
  const arSimTimer = useRef(null);

  const stopArSim = () => {
    if (arSimTimer.current) clearInterval(arSimTimer.current);
    arSimTimer.current = null;
  };

  useEffect(() => stopArSim, []);

  const startArSim = (text) => {
    stopArSim();
    if (!text) return;
    const startT = performance.now();
    const charsPerTick = Math.max(1, Math.round(AR_SIM_CHARS_PER_SEC / 20));
    let i = 0;
    setArSim({ status: 'running', text: '', fullText: text, timeMs: 0 });
    arSimTimer.current = setInterval(() => {
      i += charsPerTick;
      const elapsed = Math.round(performance.now() - startT);
      if (i >= text.length) {
        stopArSim();
        setArSim({ status: 'done', text, fullText: text, timeMs: elapsed });
      } else {
        setArSim({ status: 'running', text: text.slice(0, i), fullText: text, timeMs: elapsed });
      }
    }, 50);
  };

  const skipArSim = () => {
    setArSim(prev => {
      if (prev.status !== 'running') return prev;
      // Estimate the full duration it would have taken
      const estMs = Math.round((prev.fullText.length / AR_SIM_CHARS_PER_SEC) * 1000);
      return { status: 'done', text: prev.fullText, fullText: prev.fullText, timeMs: estMs };
    });
    stopArSim();
  };

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!apiKey) {
      setErrorMsg('상단 열쇠 아이콘을 눌러 Inception API 키를 먼저 확인하세요.');
      return;
    }

    setIsLoading(true);
    setResponseContent('');
    setRawChunks([]);
    setDenoiseSteps([]);
    setActiveStepView(0);
    setErrorMsg('');
    setMetrics({ timeMs: 0, ttftMs: 0, promptTokens: 0, completionTokens: 0, reasoningTokens: 0, tps: 0 });
    stopArSim();
    setArSim({ status: 'idle', text: '', fullText: '', timeMs: 0 });

    const startTime = performance.now();
    let firstTokenTime = 0;
    let fullText = '';
    const chunkList = [];
    const stepList = [];

    abortRef.current = new AbortController();

    try {
      const isStream = streamMode === 'stream' || streamMode === 'diffusing';
      const isDiffusing = streamMode === 'diffusing';

      const payload = {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: Number(maxTokens),
        stream: isStream
      };

      if (model.startsWith('mercury')) {
        payload.reasoning_effort = reasoningEffort;
      }
      if (isDiffusing) {
        payload.diffusing = true;
      }

      const res = await fetch('https://api.inceptionlabs.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status} ${res.statusText}`);
      }

      let finalUsage = null;

      if (!isStream) {
        const data = await res.json();
        fullText = data.choices?.[0]?.message?.content || '';
        finalUsage = data.usage;
        setResponseContent(fullText);
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let stepCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const parsed = JSON.parse(jsonStr);
              chunkList.push(jsonStr);
              setRawChunks([...chunkList]);

              if (parsed.usage) {
                finalUsage = parsed.usage;
              }

              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                if (!firstTokenTime) {
                  firstTokenTime = Math.round(performance.now() - startTime);
                }

                if (isDiffusing) {
                  stepCount++;
                  stepList.push({ step: stepCount, text: delta, time: Math.round(performance.now() - startTime) });
                  // In diffusing mode each chunk is the full refined text, not an append
                  fullText = delta;
                  setResponseContent(delta);
                  setDenoiseSteps([...stepList]);
                  setActiveStepView(stepCount);
                } else {
                  fullText += delta;
                  setResponseContent(fullText);
                }
              }
            } catch (e) {}
          }
        }
      }

      const totalDuration = Math.round(performance.now() - startTime);
      const estTokens = Math.round(fullText.length / 3);
      const outTokens = finalUsage?.completion_tokens || estTokens;

      setMetrics({
        timeMs: totalDuration,
        ttftMs: firstTokenTime,
        promptTokens: finalUsage?.prompt_tokens || Math.round(prompt.length / 3),
        completionTokens: outTokens,
        reasoningTokens: finalUsage?.completion_tokens_details?.reasoning_tokens || 0,
        tps: totalDuration > 0 ? Math.round(outTokens / (totalDuration / 1000)) : 0
      });

      // Right after Mercury finishes, replay the same answer at classic LLM speed
      startArSim(fullText);

    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'API 호출 중 오류 발생');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseContent) return;
    navigator.clipboard.writeText(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="playground" className="wb-section">
      {/* Section Narrative */}
      <div className="section-narrative">
        <div className="section-kicker font-mono text-purple">01 / 직접 써보기 (LIVE TEST)</div>
        <h2 className="section-title">
          직접 질문해보세요 — 얼마나 빠른지 바로 느껴집니다
        </h2>
        <p className="section-subtitle">
          질문 버튼 하나 고르고 <strong>[실행]</strong>을 누르면 진짜 인셉션 AI가 답을 만들어요.
          답이 끝나면 <strong>같은 답을 기존 AI 방식(한 글자씩)으로 받았다면 얼마나 걸렸을지</strong> 바로 아래에서 나란히 보여드립니다.
        </p>
      </div>

      {/* Flat Clean Workbench Layout (No nested boxes) */}
      <div className="flat-workbench-grid">
        {/* Left: Input & Config Column */}
        <div className="flat-wb-col input-col">
          <div className="flat-config-row">
            <div className="cfg-item">
              <label className="font-mono text-xs text-muted">모델 선택</label>
              <select 
                className="flat-select font-mono"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isLoading}
              >
                <option value="mercury-3">mercury-3 (1M CTX / Flagship)</option>
                <option value="mercury-2.5">mercury-2.5 (260K CTX)</option>
                <option value="mercury-2">mercury-2 (128K CTX)</option>
              </select>
            </div>

            <div className="cfg-item">
              <label className="font-mono text-xs text-muted">답변 받는 방식</label>
              <select 
                className="flat-select font-mono text-emerald"
                value={streamMode}
                onChange={(e) => setStreamMode(e.target.value)}
                disabled={isLoading}
              >
                <option value="diffusing">화가 방식 (diffusing — 추천)</option>
                <option value="stream">타자기처럼 받기 (stream)</option>
                <option value="sync">한 번에 받기 (동기)</option>
              </select>
            </div>
          </div>

          <div className="cfg-item mt-2">
            <div className="flex-row justify-between items-center mb-1">
              <label className="font-mono text-xs text-muted">생각 깊이 (REASONING)</label>
              <span className="font-mono text-xs text-purple">{reasoningEffort}</span>
            </div>
            <div className="flat-pills-bar">
              {['instant', 'low', 'medium', 'high'].map(r => (
                <button
                  key={r}
                  className={`flat-pill-btn ${reasoningEffort === r ? 'active' : ''}`}
                  onClick={() => setReasoningEffort(r)}
                  disabled={isLoading}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="cfg-item mt-3">
            <label className="font-mono text-xs text-muted mb-1 block">추천 질문 (누르면 자동 입력):</label>
            <div className="flat-presets-list">
              {WORKBENCH_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  className="flat-preset-tag font-mono"
                  onClick={() => setPrompt(p.prompt)}
                  disabled={isLoading}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flat-textarea-wrapper mt-3">
            <textarea
              className="flat-textarea"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="질문 또는 코딩/추론 프롬프트를 입력하세요..."
              disabled={isLoading}
            />
            <div className="flat-textarea-footer">
              <span className="font-mono text-xs text-muted">{prompt.length} chars</span>
              <button
                className="eng-btn eng-btn-primary"
                onClick={handleSend}
                disabled={isLoading || !prompt.trim()}
              >
                <Send size={14} />
                <span>{isLoading ? '추론 중...' : '실행 (Run)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output Canvas Column */}
        <div className="flat-wb-col output-col">
          <div className="output-tab-bar">
            <div className="tab-group">
              <button 
                className={`output-tab-btn ${activeTab === 'rendered' ? 'active' : ''}`}
                onClick={() => setActiveTab('rendered')}
              >
                렌더링 결과
              </button>
              {streamMode === 'diffusing' && (
                <button 
                  className={`output-tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setActiveTab('steps')}
                >
                  스텝 ({denoiseSteps.length})
                </button>
              )}
              <button 
                className={`output-tab-btn ${activeTab === 'sse' ? 'active' : ''}`}
                onClick={() => setActiveTab('sse')}
              >
                SSE 로그
              </button>
            </div>

            <button 
              className="eng-btn eng-btn-secondary eng-btn-xs"
              onClick={handleCopy}
              disabled={!responseContent}
            >
              {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
              <span>{copied ? '복사됨' : '복사'}</span>
            </button>
          </div>

          <div className="flat-canvas-body">
            {errorMsg && (
              <div className="flat-error-alert font-mono">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {isLoading && !responseContent && (
              <div className="flat-empty-stage">
                <div className="flat-spinner"></div>
                <span className="font-mono text-xs text-emerald mt-3">
                  Mercury-3 dLLM Discrete Diffusion 포워드 패스 실행 중...
                </span>
              </div>
            )}

            {activeTab === 'rendered' && responseContent && (
              <div className="flat-rendered-output">
                {responseContent}
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="flat-steps-viewer">
                <div className="step-chips-row mb-2">
                  {denoiseSteps.map((st, i) => (
                    <button
                      key={i}
                      className={`flat-pill-btn ${activeStepView === st.step ? 'active' : ''}`}
                      onClick={() => setActiveStepView(st.step)}
                    >
                      Step {st.step} ({st.time}ms)
                    </button>
                  ))}
                </div>
                <div className="flat-code-block font-mono">
                  {denoiseSteps.find(s => s.step === activeStepView)?.text || responseContent}
                </div>
              </div>
            )}

            {activeTab === 'sse' && (
              <div className="flat-code-block sse-scroll font-mono">
                {rawChunks.length > 0 ? (
                  rawChunks.map((chunk, i) => (
                    <div key={i} className="sse-line">
                      <span className="text-emerald">[{i + 1}]</span> {chunk}
                    </div>
                  ))
                ) : (
                  <span className="text-muted">스트리밍 패킷이 여기에 로깅됩니다.</span>
                )}
              </div>
            )}

            {!isLoading && !responseContent && !errorMsg && (
              <div className="flat-empty-stage">
                <Terminal size={24} className="text-muted opacity-40 mb-2" />
                <span className="text-xs text-muted">프롬프트를 전송하면 실시간 답변과 속도 통계가 즉시 표시됩니다.</span>
              </div>
            )}
          </div>

          {/* Intuitive side-by-side: what if a classic LLM typed the same answer? */}
          {arSim.status !== 'idle' && (
            <div className="ar-compare-panel">
              <div className="ar-compare-head">
                <span className="ar-compare-title">
                  🖨️ 같은 답을 <strong>기존 AI 방식(한 글자씩)</strong>으로 받는다면? <span className="text-muted">(시뮬레이션)</span>
                </span>
                <div className="flex-row items-center gap-2">
                  <span className="track-live-timer font-mono text-amber">
                    <Clock size={13} />
                    <span>{(arSim.timeMs / 1000).toFixed(1)}s</span>
                  </span>
                  {arSim.status === 'running' && (
                    <button className="eng-btn eng-btn-outline eng-btn-xs" onClick={skipArSim}>
                      <FastForward size={11} /> 건너뛰기
                    </button>
                  )}
                </div>
              </div>

              <div className="ar-compare-body">
                {arSim.text}
                {arSim.status === 'running' && <span className="ar-cursor">▌</span>}
              </div>

              <div className="ar-compare-verdict font-mono text-xs">
                {arSim.status === 'running' ? (
                  <span className="text-amber">
                    ⏳ 기존 방식은 아직 타이핑 중... (인셉션은 {(metrics.timeMs / 1000).toFixed(1)}초 전에 이미 끝!)
                  </span>
                ) : (
                  <span className="text-emerald">
                    <Zap size={12} style={{ verticalAlign: '-2px' }} /> 인셉션 {(metrics.timeMs / 1000).toFixed(1)}초 vs 기존 방식 {(arSim.timeMs / 1000).toFixed(1)}초
                    {metrics.timeMs > 0 && ` — 약 ${Math.max(1, (arSim.timeMs / metrics.timeMs)).toFixed(1)}배 빨랐습니다`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Minimal Telemetry Line (Borderless) */}
          <div className="flat-telemetry-row font-mono text-xs">
            <div className="tel-item">
              <span className="text-muted">소요:</span>
              <span className="text-emerald font-bold">{metrics.timeMs}ms</span>
            </div>
            <div className="tel-item">
              <span className="text-muted">TTFT:</span>
              <span>{metrics.ttftMs}ms</span>
            </div>
            <div className="tel-item">
              <span className="text-muted">추론:</span>
              <span className="text-purple">{metrics.reasoningTokens}tok</span>
            </div>
            <div className="tel-item">
              <span className="text-muted">출력:</span>
              <span>{metrics.completionTokens}tok</span>
            </div>
            <div className="tel-item">
              <span className="text-muted">속도:</span>
              <span className="text-emerald font-bold">{metrics.tps} tok/s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
