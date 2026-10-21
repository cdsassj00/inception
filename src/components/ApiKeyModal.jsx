import React, { useState } from 'react';
import { X, Key, Check, RotateCcw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { DEFAULT_API_KEY } from '../config';

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [inputKey, setInputKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setInputKey(DEFAULT_API_KEY);
    onSaveKey(DEFAULT_API_KEY);
  };

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div className="bento-card wb-modal-card" onClick={e => e.stopPropagation()}>
        <div className="card-header-bar">
          <div className="flex-row items-center gap-2">
            <Key className="text-emerald" size={15} />
            <span className="font-mono font-bold text-strong">INCEPTION API CREDENTIALS</span>
          </div>
          <button className="eng-btn eng-btn-outline eng-btn-xs" onClick={onClose} aria-label="닫기">
            <X size={14} />
          </button>
        </div>

        <div className="wb-modal-body p-4">
          <p className="text-xs text-secondary leading-relaxed mb-3">
            Inception Platform (<a href="https://platform.inceptionlabs.ai" target="_blank" rel="noreferrer" className="text-emerald underline">platform.inceptionlabs.ai</a>)에서 
            발급된 API 키입니다. 로컬 스토리지에 안전하게 보관되며 브라우저에서 직접 초고속 호출됩니다.
          </p>

          <div className="apikey-field-group mb-3">
            <div className="apikey-input-frame">
              <input 
                type={showKey ? "text" : "password"}
                className="apikey-text-input font-mono"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk_..."
              />
              <button 
                className="eng-btn eng-btn-outline eng-btn-xs"
                type="button"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            <div className="flex-row justify-between items-center text-xs text-muted mt-2">
              <span className="flex-row items-center gap-1 font-mono">
                <ShieldCheck size={12} className="text-emerald" /> 기본 키 탑재됨
              </span>
              <button className="eng-btn eng-btn-outline eng-btn-xs font-mono" type="button" onClick={handleReset}>
                <RotateCcw size={11} /> 기본 키 복원
              </button>
            </div>
          </div>

          <div className="flex-row justify-between items-center pt-3 border-t border-hairline">
            <button className="eng-btn eng-btn-secondary eng-btn-sm font-mono" onClick={onClose}>
              닫기
            </button>
            <button className="eng-btn eng-btn-primary eng-btn-sm font-mono" onClick={handleSave}>
              {saved ? <Check size={13} /> : null}
              <span>{saved ? '저장 완료' : '키 저장하기'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
