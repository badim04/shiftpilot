import { companyById, DAYS, dk, TODAY_KEY } from '../data/seed';
import { fmtDayNum } from '../data/helpers';
import { jamieShifts } from './selectors';
import type { RotaData } from '../data/types';

export function WeekStrip({
  data,
  selected,
  onSelect,
}: {
  data: RotaData;
  selected: string;
  onSelect: (k: string) => void;
}) {
  const mine = jamieShifts(data);
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {DAYS.map((d, i) => {
        const key = dk(i);
        const dayShifts = mine.filter((s) => s.date === key);
        const isSel = key === selected;
        const isToday = key === TODAY_KEY;
        const cos = [...new Set(dayShifts.map((s) => s.companyId))];
        return (
          <button
            key={d}
            onClick={() => onSelect(key)}
            style={{
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderRadius: 13,
              padding: '9px 0 7px',
              background: isSel ? 'var(--accent)' : 'var(--surface)',
              boxShadow: isSel ? 'none' : 'inset 0 0 0 1px var(--line)',
              transition: 'background .15s',
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 0.5,
                color: isSel ? 'var(--accent-ink)' : 'var(--ink-3)',
                opacity: isSel ? 0.8 : 1,
              }}
            >
              {d[0]}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: isSel ? 'var(--accent-ink)' : 'var(--ink)',
                marginTop: 2,
                ...(isToday && !isSel
                  ? { textDecoration: 'underline', textDecorationColor: 'var(--accent)', textUnderlineOffset: 3 }
                  : {}),
              }}
            >
              {fmtDayNum(key)}
            </div>
            <div style={{ display: 'flex', gap: 2.5, justifyContent: 'center', height: 5, marginTop: 4 }}>
              {cos.slice(0, 3).map((cid) => (
                <span
                  key={cid}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isSel ? 'var(--accent-ink)' : companyById(cid).color,
                    opacity: isSel ? 0.85 : 1,
                  }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
