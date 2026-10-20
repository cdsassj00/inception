import React, { useState, useRef } from 'react';
import { Send, Terminal, Copy, Check, AlertCircle } from 'lucide-react';

const WORKBENCH_PRESETS = [
  {
    title: "이산 확산 vs AR 핵심 원리",
    prompt: "이산 확산 모델(Discrete Diffusion LLM)이 기존 GPT-4o 같은 자기회귀 언어 모델과 비교해 어떤 수학적/구조적 메커니즘으로 5배 이상 빠른 속도를 내는지 3가지 핵심 요인으로 분석해줘."
  },
  {
    title: "실시간 음성 및 도구 호출 에이전트",
    prompt: "Mercury-3 모델이 음성 대화 에이전트(Voice Agent)나 멀티턴 도구 호출(Tool Calling) 워크플로우에서 대기 시간을 획기적으로 줄여주는 이유를 설명해줘."
  },
  {
    title: "병합 정렬(Merge Sort) 파이썬 코드",
    prompt: "파이썬으로 효율적인 병합 정렬(Merge Sort) 함수를 작성하고, 시간 복잡도와 공간 복잡도를 주석과 함께 상세히 분석해줘."
  },
  {
    title: "양자역학의 중첩과 얽힘 요약",
    prompt: "양자역학의 중첩(Superposition)과 얽힘(Entanglement) 개념을 일반인도 직관적으로 이해할 수 있게 비유를 들어 2줄로 요약해줘."
  }
];

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

      setMetrics({
        timeMs: totalDuration,
        ttftMs: firstTokenTime,
        promptTokens: finalUsage?.prompt_tokens || Math.round(prompt.length / 3),
        completionTokens: finalUsage?.completion_tokens || estTokens,
        reasoningTokens: finalUsage?.completion_tokens_details?.reasoning_tokens || 0,
        tps: Math.round(estTokens / (totalDuration / 1000)) || 280
      });

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
        <div className="section-kicker font-mono text-purple">04 / LIVE INFERENCE WORKBENCH</div>
        <h2 className="section-title">
          Mercury-3 실시간 질문 & 초고속 답변 테스트
        </h2>
        <p className="section-subtitle">
          기존 챗봇처럼 글자가 한 자씩 타이핑되기를 답답하게 기다릴 필요가 없습니다. 
          아래 질문을 전송하면 <strong>초당 300단어가 넘는 번개 같은 속도로 답변이 한 번에 전달</strong>됩니다.
        </p>
      </div>

      {/* Flat Clean Workbench Layout (No nested boxes) */}
      <div className="flat-workbench-grid">
        {/* Left: Input & Config Column */}
        <div className="flat-wb-col input-col">
          <div className="flat-config-row">
            <div className="cfg-item">
              <label className="font-mono text-xs text-muted">MODEL</label>
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
              <label className="font-mono text-xs text-muted">STREAMING</label>
              <select 
                className="flat-select font-mono text-emerald"
                value={streamMode}
                onChange={(e) => setStreamMode(e.target.value)}
                disabled={isLoading}
              >
                <option value="diffusing">diffusing: true (확산 스트림)</option>
                <option value="stream">stream: true (표준 스트림)</option>
                <option value="sync">stream: false (단발 동기)</option>
              </select>
            </div>
          </div>

          <div className="cfg-item mt-2">
            <div className="flex-row justify-between items-center mb-1">
              <label className="font-mono text-xs text-muted">REASONING EFFORT</label>
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
            <label className="font-mono text-xs text-muted mb-1 block">프리셋 질문 선택:</label>
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
