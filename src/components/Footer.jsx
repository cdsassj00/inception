import React from 'react';
import { Cpu, ExternalLink, BookOpen, Terminal, UploadCloud } from 'lucide-react';

export default function Footer({ onOpenDeploy }) {
  return (
    <footer className="wb-footer">
      <div className="wb-footer-inner">
        <div className="wb-footer-brand">
          <div className="flex-row items-center gap-2">
            <div className="wb-brand-icon">
              <Cpu size={16} className="text-emerald" />
            </div>
            <span className="font-mono font-bold text-white">INCEPTION MERCURY dLLM WORKBENCH</span>
          </div>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            이산 확산(Discrete Diffusion) 기반 언어 모델의 병렬 디노이징 원리와 
            순차 자기회귀(AR) 모델 간의 성능 혁신을 시연하고 분석하는 엔지니어링 및 강의용 워크벤치입니다.
          </p>
        </div>

        <div className="wb-footer-links">
          <div className="wb-footer-col">
            <span className="font-mono text-xs text-white">OFFICIAL SPECS</span>
            <a href="https://docs.inceptionlabs.ai" target="_blank" rel="noreferrer" className="wb-footer-link">
              <BookOpen size={12} /> 공식 API 문서
            </a>
            <a href="https://docs.inceptionlabs.ai/llms.txt" target="_blank" rel="noreferrer" className="wb-footer-link">
              <ExternalLink size={12} /> llms.txt 인덱스
            </a>
            <a href="https://platform.inceptionlabs.ai" target="_blank" rel="noreferrer" className="wb-footer-link">
              <ExternalLink size={12} /> 인셉션 개발자 콘솔
            </a>
          </div>

          <div className="wb-footer-col">
            <span className="font-mono text-xs text-white">DEPLOYMENT</span>
            <button className="wb-footer-btn font-mono" onClick={onOpenDeploy}>
              <UploadCloud size={12} /> Vercel CLI 배포 가이드
            </button>
            <span className="font-mono text-xs text-muted">Vercel CLI 59.x & Vite React</span>
          </div>
        </div>
      </div>

      <div className="wb-footer-bottom">
        <span className="font-mono text-xs text-muted">
          © 2026 Inception Mercury Architecture Lab. All rights reserved.
        </span>
        <span className="eng-badge eng-badge-emerald font-mono text-xs">
          Powered by Inception Mercury-3 dLLM
        </span>
      </div>
    </footer>
  );
}
