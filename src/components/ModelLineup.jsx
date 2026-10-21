import React, { useState } from 'react';
import { Terminal, Copy, Check, CheckCircle2, Cpu, Mic, Code2, ListCheck } from 'lucide-react';

const MODELS_DATA = [
  {
    id: 'mercury-3',
    icon: Cpu,
    name: 'Mercury 3',
    tier: '최신 플래그십',
    tierColor: 'eng-badge-emerald',
    desc: '1,000,000 (1M) 토큰 문맥과 최대 131,072 토큰 출력을 지원하는 최고 지능 이산 확산 모델. Copilot Arena 속도 1위.',
    endpoint: 'v1/chat/completions',
    context: '1,000,000 토큰',
    price: '$0.10 / $0.35',
    bullets: ['Tool Calling & Structured Outputs', '4단계 Reasoning Effort 조절', 'Diffusing 스트리밍 시각화', '1M 토큰 실시간 조망']
  },
  {
    id: 'mercury-voice',
    icon: Mic,
    name: 'Mercury Voice',
    tier: '음성 에이전트',
    tierColor: 'eng-badge-purple',
    desc: '자연스러운 실시간 음성 대화를 위해 극단적으로 첫 반응 지연시간(TTFT)을 낮춘 확산 LLM. Vapi, LiveKit, ElevenLabs 연동.',
    endpoint: 'v1/chat/completions',
    context: '128,000 토큰',
    price: '$0.20 / $0.75',
    bullets: ['초저지연 발화 턴어라운드', '장문 시스템 프롬프트 순응', '음성 스택(LiveKit/Pipecat) 호환', '도구 호출 지원']
  },
  {
    id: 'mercury-edit-2',
    icon: Code2,
    name: 'Mercury Edit 2',
    tier: '코드 FIM & 편집',
    tierColor: 'eng-badge-blue',
    desc: 'IDE 인라인 코드 자동완성(Fill-in-the-Middle)과 다음 편집 예측(Next Edit) 전용 모델. Cursor, Zed 에디터 연동 지원.',
    endpoint: 'v1/fim/completions, v1/edit/completions',
    context: '32,000 토큰',
    price: '$0.25 / $0.75',
    bullets: ['FIM 인라인 제안', 'Next-Edit 다음 수정 예측', 'Git Diff 히스토리 파싱', '양방향 코드 문맥 인식']
  },
  {
    id: 'mercury-decide',
    icon: ListCheck,
    name: 'Mercury Decide',
    tier: '초저비용 의사결정',
    tierColor: 'eng-badge-emerald',
    desc: '공유 상태에 대한 이진 확률, 범주형 분류, 순위 채점을 전담하는 특수 엔진. 출력 토큰 비용 $0원!',
    endpoint: 'v1/decisions',
    context: '65,536 토큰',
    price: '$0.02 (출력 $0 무료)',
    bullets: ['출력 토큰 과금 $0 (무료)', '대규모 배치 평가 최적화', '가드레일 & 라우팅 전용', '구조화된 의사결정']
  }
];

export default function ModelLineup() {
  const [selectedSdk, setSelectedSdk] = useState('js');
  const [copied, setCopied] = useState(false);

  const sdkCodes = {
    js: `// npm install inceptionai (또는 openai 라이브러리 그대로 호환)
import Inception from 'inceptionai';

const client = new Inception({
  apiKey: process.env.INCEPTION_API_KEY // 'sk_...'
});

// Mercury 3 Diffusion 스트리밍 호출
const stream = await client.chat.completions.create({
  model: 'mercury-3',
  messages: [{ role: 'user', content: '확산 모델의 장점을 설명해줘' }],
  reasoning_effort: 'low',
  stream: true,
  diffusing: true // Inception 고유 노이즈 디노이징 모드!
});

for await (const chunk of stream) {
  // diffusing: true 모드에서는 매 chunk가 정제 중인 전체 텍스트입니다
  console.log(chunk.choices[0]?.delta?.content ?? '');
}`,
    python: `# pip install inceptionai
from inceptionai import Inception

client = Inception(api_key="your_api_key_here")

response = client.chat.completions.create(
    model="mercury-3",
    messages=[{"role": "user", "content": "이산 확산 언어 모델의 원리는?"}],
    reasoning_effort="medium",
    max_completion_tokens=1000
)

print(response.choices[0].message.content)
print(f"추론 토큰: {response.usage.completion_tokens_details.reasoning_tokens}")`,
    curl: `# OpenAI 호환 REST 엔드포인트
curl https://api.inceptionlabs.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $INCEPTION_API_KEY" \\
  -d '{
    "model": "mercury-3",
    "messages": [
      {"role": "user", "content": "What is a discrete diffusion LLM?"}
    ],
    "reasoning_effort": "low",
    "max_completion_tokens": 1000,
    "stream": true,
    "diffusing": true
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sdkCodes[selectedSdk]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="models" className="wb-section">
      <div className="wb-section-header">
        <span className="eng-badge eng-badge-blue">MERCURY MODEL FAMILY</span>
        <h2 className="wb-section-title">
          목적별 최적화된 Inception 확산 모델 라인업
        </h2>
        <p className="wb-section-desc">
          초대형 범용 추론부터 초저지연 음성 대화, IDE 코드 자동완성, 
          초저비용 라우팅까지 목적에 맞게 세분화된 모델군을 제공합니다.
        </p>
      </div>

      {/* Model Spec Bento Grid */}
      <div className="bento-grid-2 mb-4">
        {MODELS_DATA.map((m) => {
          const IconComp = m.icon;
          return (
            <div key={m.id} className="bento-card model-spec-card">
              <div className="card-header-bar">
                <div className="flex-row items-center gap-2">
                  <IconComp size={15} className="text-emerald" />
                  <span className="font-mono font-bold text-strong">{m.name}</span>
                </div>
                <span className={`eng-badge ${m.tierColor}`}>{m.tier}</span>
              </div>

              <div className="model-spec-body">
                <p className="model-desc-text">{m.desc}</p>

                <div className="model-meta-grid font-mono">
                  <div className="meta-cell">
                    <span className="meta-k">단가 (1M 토큰)</span>
                    <span className="meta-v text-emerald">{m.price}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="meta-k">컨텍스트</span>
                    <span className="meta-v text-blue">{m.context}</span>
                  </div>
                  <div className="meta-cell span-2">
                    <span className="meta-k">엔드포인트</span>
                    <span className="meta-v text-muted">{m.endpoint}</span>
                  </div>
                </div>

                <div className="model-bullets-list">
                  {m.bullets.map((b, idx) => (
                    <div key={idx} className="bullet-row">
                      <CheckCircle2 size={13} className="text-emerald flex-shrink-0" />
                      <span className="text-xs text-secondary">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Developer Integration Code Box */}
      <div className="bento-card sdk-integration-box">
        <div className="card-header-bar">
          <div className="flex-row items-center gap-2">
            <Terminal size={14} className="text-emerald" />
            <span className="font-mono text-xs">OPENAI COMPATIBLE INTEGRATION CODE</span>
          </div>

          <div className="flex-row items-center gap-2">
            <div className="flex-row gap-1">
              <button 
                className={`eng-btn eng-btn-xs font-mono ${selectedSdk === 'js' ? 'eng-btn-primary' : 'eng-btn-secondary'}`}
                onClick={() => setSelectedSdk('js')}
              >
                TypeScript / Node
              </button>
              <button 
                className={`eng-btn eng-btn-xs font-mono ${selectedSdk === 'python' ? 'eng-btn-primary' : 'eng-btn-secondary'}`}
                onClick={() => setSelectedSdk('python')}
              >
                Python
              </button>
              <button 
                className={`eng-btn eng-btn-xs font-mono ${selectedSdk === 'curl' ? 'eng-btn-primary' : 'eng-btn-secondary'}`}
                onClick={() => setSelectedSdk('curl')}
              >
                cURL
              </button>
            </div>

            <button 
              className="eng-btn eng-btn-outline eng-btn-xs"
              onClick={handleCopyCode}
            >
              {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
              <span>{copied ? '복사됨' : '복사'}</span>
            </button>
          </div>
        </div>

        <div className="code-box p-3 font-mono">
          <pre>{sdkCodes[selectedSdk]}</pre>
        </div>
      </div>
    </section>
  );
}
