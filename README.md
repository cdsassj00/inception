# Inception Mercury dLLM Studio 🎨⚡

> **이산 확산(Discrete Diffusion) 기반 차세대 LLM 교육 & 실시간 벤치마크 워크벤치**  
> 기존의 순차 생성(Autoregressive, $O(N)$) 타자기 방식에서, 3단계 병렬 디노이징($O(1)$) 초고속 화가 방식으로의 패러다임 전환을 시각적으로 탐구합니다.

[![Vercel Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-emerald?style=for-the-badge&logo=vercel)](https://inception-mercury-studio.vercel.app)
[![Inception AI](https://img.shields.io/badge/Model-Mercury--3-blue?style=for-the-badge)](https://inceptionlabs.ai)

---

## 🌟 주요 기능 및 탐구 영역

### 1. 🏎️ 속도 레이스 아레나 (Speed Benchmark)
- **순차 타자기(기존 GPT/Claude)** vs **3스텝 초고속 화가(Inception Mercury-3)**의 실시간 속도 대결
- 토큰 수가 길어질수록 5~10배까지 벌어지는 극적인 지연 시간(Latency) 격차를 시각적으로 시뮬레이션

### 2. 🧪 디노이징 스크러버 랩 (Interactive Denoising)
- Stable Diffusion/Midjourney처럼 **완전한 텍스트 잡음(Noise)에서 단 3번의 붓질로 문장이 완성되는 과정**을 타임라인 슬라이더로 탐색
- 각 토큰별 사후 복원 확률($p_0, p_1, p_2, p_3$)과 양방향 어텐션 신뢰도 실시간 인스펙터 제공

### 3. 🏛️ 아키텍처 대조 (Causal Mask vs Full Bidirectional)
- 앞 단어만 조망하는 **삼각 인과 마스킹(Causal Masking)**과 360도 전체 문맥을 조망하는 **완전 양방향 수용장(Bidirectional Attention)**의 구조적 차이 비교
- GPU 텐서 코어 가동 효율(Memory-Bound vs Compute-Bound) 및 5대 엔지니어링 매트릭스 분석

### 4. ⚡ Mercury-3 실시간 인터랙티브 워크벤치 (Playground)
- Inception 공식 API(`api.inceptionlabs.ai/v1/chat/completions`)를 통한 실제 Mercury-3 모델 호출
- `diffusing: true` 병렬 확산 스트리밍 및 Server-Sent Events (SSE) 패킷 실시간 로깅
- 추론 시간(Total Time), 첫 토큰 대기 시간(TTFT), 초당 생성 단어 수(TPS) 텔레메트리 제공

### 5. 📑 16:9 에디토리얼 키노트 슬라이드
- 임원/개발자/연구원 대상 강의 및 세미나에 즉시 활용할 수 있는 6개 핵심 챕터 프레젠테이션 슬라이드 덱 내장

---

## 🛠️ 기술 스택

- **Frontend**: React 19, Vite, Vanilla CSS Design System (Dual Theme: Light / Dark)
- **Design Principles**: Container-itis를 배제한 미니멀 에디토리얼 레이아웃, `uiux-design-reference` 토큰 체계
- **Icons**: Lucide React
- **API Integration**: Inception Labs Mercury API (OpenAI Compatible)
- **Deployment**: Vercel

---

## 🚀 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/cdsassj00/inception.git
cd inception

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 🔗 배포 주소
- **Production URL**: [https://inception-mercury-studio.vercel.app](https://inception-mercury-studio.vercel.app)
