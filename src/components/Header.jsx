import React from 'react';
import { Cpu, Zap, Sliders, Play, Layers, Presentation, UploadCloud, Key, Sun, Moon } from 'lucide-react';

export default function Header({ 
  activeTab, 
  onSelectTab, 
  onOpenKeynote, 
  onOpenDeploy, 
  onOpenApiKey, 
  apiKey,
  theme,
  onToggleTheme
}) {
  const tabs = [
    { id: 'playground', num: '1', label: '라이브 테스트', icon: Play, hint: 'Mercury-3 API 직접 질문 + 기존 LLM 비교' },
    { id: 'race', num: '2', label: '속도 레이스', icon: Zap, hint: '타자기 vs 초고속 화가 속도 체감' },
    { id: 'scrubber', num: '3', label: '디노이징 랩', icon: Sliders, hint: '3단계 마법 복원 원리' },
    { id: 'architecture', num: '4', label: '원리 & 스펙', icon: Layers, hint: '시야 차이 & 비용 비교' }
  ];

  return (
    <header className="wb-header">
      <div className="wb-header-inner">
        {/* Left: Brand */}
        <div className="wb-brand-cluster">
          <div className="wb-brand-icon">
            <Cpu size={16} className="text-emerald" />
          </div>
          <div>
            <div className="wb-brand-title">
              INCEPTION <span className="text-emerald font-mono">MERCURY</span>
              <span className="wb-version-tag font-mono">STUDIO</span>
            </div>
          </div>
        </div>

        {/* Center: 4 Studio Navigation Tabs */}
        <nav className="studio-tab-nav" role="tablist" aria-label="Studio Modes">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                className={`studio-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(t.id)}
                title={`단축키 [${t.num}] 키로 이동 (${t.hint})`}
              >
                <span className="tab-key-num font-mono">{t.num}</span>
                <Icon size={14} className={isActive ? "text-emerald" : "text-muted"} />
                <span className="tab-text">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="wb-actions">
          {/* Light / Dark Mode Toggle */}
          <button
            className="eng-btn eng-btn-secondary eng-btn-sm theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          >
            {theme === 'light' ? (
              <>
                <Moon size={14} className="text-blue" />
                <span className="d-none-mobile">다크</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber" />
                <span className="d-none-mobile">라이트</span>
              </>
            )}
          </button>

          <button 
            className="eng-btn eng-btn-secondary eng-btn-sm"
            onClick={onOpenKeynote}
            title="강의용 전체화면 프레젠테이션 (단축키: P)"
          >
            <Presentation size={13} className="text-emerald" />
            <span className="d-none-mobile">강의 슬라이드</span>
          </button>

          <button 
            className="eng-btn eng-btn-primary eng-btn-sm"
            onClick={onOpenDeploy}
            title="Vercel CLI 배포 가이드"
          >
            <UploadCloud size={13} />
            <span className="d-none-mobile">배포</span>
          </button>

          <button
            className="eng-btn eng-btn-outline eng-btn-sm icon-only"
            onClick={onOpenApiKey}
            title="API 키 관리"
            aria-label="API 키 관리"
          >
            <Key size={13} className={apiKey ? "text-emerald" : "text-muted"} />
          </button>
        </div>
      </div>
    </header>
  );
}
