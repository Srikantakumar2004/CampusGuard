import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck,
  HardDrive,
  WifiOff,
} from 'lucide-react';
import { getPlatformInfo } from '../utils/platform';

export default function InstallAppModal({ onClose, deferredPrompt, onInstallSuccess }) {
  const platform = getPlatformInfo();
  const [selectedPlatform, setSelectedPlatform] = useState(platform.os);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } else {
      alert('To install CampusGuard on desktop: Click the Install icon (⤓) in your browser address bar.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--brand-primary-light)' }}>
            <Download size={20} />
            <span>Install CampusGuard App</span>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Platform Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
            {['windows', 'macos', 'ios', 'android'].map((osKey) => (
              <button
                key={osKey}
                type="button"
                className={`btn btn-xs ${selectedPlatform === osKey ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, textTransform: 'uppercase', fontWeight: 700 }}
                onClick={() => setSelectedPlatform(osKey)}
              >
                {osKey === 'ios' ? 'Apple iOS' : osKey === 'macos' ? 'macOS' : osKey === 'windows' ? 'Windows' : 'Android'}
              </button>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary-light)', fontWeight: 700, fontSize: '0.82rem' }}>
                <WifiOff size={14} />
                <span>100% Offline Ready</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Cached Service Worker runs with zero internet connection.
              </p>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.82rem' }}>
                <ShieldCheck size={14} />
                <span>Native Standalone UI</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Removes browser URL bars for full-screen tactical ops.
              </p>
            </div>
          </div>

          {/* Instructions for Selected OS */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', marginTop: '0.5rem', border: '1px solid var(--border-subtle)' }}>
            {selectedPlatform === 'ios' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Install on iPhone / iPad (Safari):
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                  <span>Tap the <strong>Share</strong> button <Share2 size={13} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> in Safari toolbar.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                  <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare size={13} style={{ verticalAlign: 'middle', margin: '0 2px' }} />.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</div>
                  <span>Tap <strong>Add</strong> in the top-right corner. CampusGuard will launch as a full native app!</span>
                </div>
              </div>
            )}

            {selectedPlatform === 'macos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Install on Apple macOS:
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  In Safari: Click <strong>File &gt; Add to Dock</strong>, or in Google Chrome / Brave: Click the <strong>Install</strong> icon in the address bar.
                </p>
                <button className="btn btn-primary" onClick={handleInstallClick} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                  <Download size={15} />
                  <span>Prompt macOS Installation</span>
                </button>
              </div>
            )}

            {selectedPlatform === 'windows' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Install on Windows 10/11:
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Installs directly as an app in your Windows Start Menu and Taskbar with full offline capabilities.
                </p>
                <button className="btn btn-primary" onClick={handleInstallClick} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                  <Download size={15} />
                  <span>Install to Windows Taskbar</span>
                </button>
              </div>
            )}

            {selectedPlatform === 'android' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Install on Android (Chrome):
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Tap the button below or open Chrome options (⋮) and tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                </p>
                <button className="btn btn-primary" onClick={handleInstallClick} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                  <Download size={15} />
                  <span>Install CampusGuard APK / PWA</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
