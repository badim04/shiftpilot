import type { CSSProperties } from 'react';

const ICON_PATHS: Record<string, string> = {
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h12a4 4 0 0 1 0 8h-1"/><path d="M17 20l4-4-4-4" opacity="0"/>',
  swap2: '<path d="M16 3l4 4-4 4"/><path d="M20 7H9a5 5 0 0 0 0 10h1"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h11a5 5 0 0 0 0-10h-1"/>',
  check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  x: '<path d="M5 5l14 14M19 5 5 19"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 19c0-3.3 2.9-5 6.5-5s6.5 1.7 6.5 5"/><path d="M16 5.5a3.5 3.5 0 0 1 0 7M22 19c0-2.6-1.6-4.2-4-4.8"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z"/><path d="M10 20a2.4 2.4 0 0 0 4 0"/>',
  chat: '<path d="M4 5.5h16v11H8l-4 3.5z"/>',
  pound: '<path d="M8.5 20h8M9 20c1.5-1.2 2-2.6 2-4.5V9.5a3.5 3.5 0 0 1 6.2-2.2M7.5 13H14"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M3 12h18"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  chevD: '<path d="M5 9l7 7 7-7"/>',
  pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  send: '<path d="M4 12 21 4l-7 17-3-7-7-2z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.2-1.3L13.8 2h-3.6L9.6 4.5a7 7 0 0 0-2.2 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.2 1.3L10.2 22h3.6l.6-2.5a7 7 0 0 0 2.2-1.3l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2.5M12 20v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1.5 12H4M20 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"/>',
  coffee: '<path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 2v2.5M11 2v2.5"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8l-4 4 4 4M6 12h12"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
};

export interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  fill?: boolean;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, stroke = 1.8, fill = false, style = {} }: IconProps) {
  const p = ICON_PATHS[name] || '';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: p }}
    />
  );
}
