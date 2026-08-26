import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function parseClockDuration(value) {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return Number(hours || 0) * 3600 + Number(minutes) * 60 + Number(seconds);
}

export function formatKoreanDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0초';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const parts = [];
  if (hours) parts.push(`${hours.toLocaleString('ko-KR')}시간`);
  if (minutes) parts.push(`${minutes}분`);
  if (seconds || parts.length === 0) parts.push(`${seconds}초`);
  return parts.join(' ');
}

export function summarizeReelDurations(reels) {
  let total = 0;
  for (const reel of reels) total += parseClockDuration(reel.duration);
  return formatKoreanDuration(total);
}

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 900);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      className="rs-scroll-top"
      data-visible={visible ? '' : undefined}
      inert={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="목록 맨 위로"
    >
      <ArrowUp size={18} />
    </button>
  );
}
