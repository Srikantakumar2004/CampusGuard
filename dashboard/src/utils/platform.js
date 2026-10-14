// CampusGuard Multiplatform & Offline Queue Engine (iOS, Android, Windows, macOS)

export function getPlatformInfo() {
  if (typeof window === 'undefined') return { os: 'unknown', isMobile: false, isPwa: false };

  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  let os = 'windows';
  if (/iphone|ipad|ipod/.test(ua)) {
    os = 'ios';
  } else if (/android/.test(ua)) {
    os = 'android';
  } else if (/macintosh|mac os x/.test(ua) || /macintel/.test(platform)) {
    os = 'macos';
  } else if (/win/.test(platform) || /windows/.test(ua)) {
    os = 'windows';
  } else if (/linux/.test(platform)) {
    os = 'linux';
  }

  const isMobile = os === 'ios' || os === 'android' || window.innerWidth < 768;
  const isPwa = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  return {
    os,
    isMobile,
    isPwa,
    osLabel: os === 'ios' ? 'Apple iOS' : os === 'macos' ? 'Apple macOS' : os === 'android' ? 'Android' : 'Windows 11',
  };
}

export function triggerHaptic(style = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (style === 'heavy') {
        navigator.vibrate([40, 60, 40]);
      } else if (style === 'warning') {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate(25);
      }
    } catch {}
  }
}

// Offline Queue Persistence Layer
const QUEUE_STORAGE_KEY = 'campusguard_offline_sync_queue';

export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineAction(action) {
  const queue = getOfflineQueue();
  const item = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...action,
  };
  queue.push(item);
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  return queue;
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}
