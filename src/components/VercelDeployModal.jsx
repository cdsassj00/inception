import React, { useState } from 'react';
import { X, Copy, Check, UploadCloud, Terminal, ShieldCheck } from 'lucide-react';

export default function VercelDeployModal({ isOpen, onClose }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const steps = [
    {
      title: "1. Vercel CLI 로그인 (브라우저 연동)",
      cmd: "vercel login",
      desc: "터미널에서 실행하여 GitHub 계정 또는 이메일 인증을 완료합니다."
    },
    {
      title: "2. 프리뷰 배포 및 프로젝트 생성",
      cmd: "vercel",
      desc: "프로젝트 루트 디렉토리에서 엔터(Y)를 눌러 1분 내에 프리뷰 URL을 생성합니다."
    },
    {
      title: "3. 프로덕션(운영) 정식 배포",
      cmd: "vercel --prod",
      desc: "전 세계 CDN 엣지에 최적화된 최종 정식 도메인으로 즉각 배포합니다."
    }
  ];

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div className="bento-card wb-modal-card" onClick={e => e.stopPropagation()}>
        <div className="card-header-bar">
          <div className="flex-row items-center gap-2">
            <UploadCloud className="text-emerald" size={15} />
            <span className="font-mono font-bold text-white">VERCEL CLI DEPLOYMENT GUIDE</span>
          </div>
          <button className="eng-btn eng-btn-outline eng-btn-xs" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="wb-modal-body p-4">
          <p className="text-xs text-secondary leading-relaxed mb-3">
            이미 프로젝트 루트에 <code className="font-mono text-emerald">vercel.json</code>이 설정되어 있어 
            Vite 정적 번들 빌드(<code className="font-mono">dist</code>)가 완전 자동화되어 있습니다.
          </p>

          <div className="deploy-steps-container mb-3">
            {steps.map((st, i) => (
              <div key={i} className="deploy-step-box mb-2">
                <div className="flex-row items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-white">{st.title}</span>
                  <button 
                    className="eng-btn eng-btn-outline eng-btn-xs font-mono"
                    onClick={() => copyText(st.cmd, i)}
                  >
                    {copiedIdx === i ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                    <span>{copiedIdx === i ? '복사됨' : '복사'}</span>
                  </button>
                </div>
                <div className="cmd-snippet font-mono text-xs text-emerald mb-1">
                  $ {st.cmd}
                </div>
                <span className="text-xs text-muted leading-tight block">{st.desc}</span>
              </div>
            ))}
          </div>

          <div className="flex-row justify-end pt-3 border-t border-hairline">
            <button className="eng-btn eng-btn-primary eng-btn-sm font-mono" onClick={onClose}>
              확인 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
