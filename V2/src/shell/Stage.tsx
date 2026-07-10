import { IOSDevice } from '../frames/IOSDevice';
import { ChromeWindow } from '../frames/ChromeWindow';
import { WorkerApp } from '../worker/WorkerApp';
import { CompanyApp } from '../company/CompanyApp';
import { fmtHM, useFitScale, useRotaClock } from '../ui/hooks';
import { isDark } from '../theme';
import type { ThemeKey } from '../theme';

export function WorkerStage({ themeKey }: { themeKey: ThemeKey }) {
  const [ref, scale] = useFitScale(402, 874);
  const clock = useRotaClock(30000);
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg-2)',
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <IOSDevice width={402} height={874} dark={isDark(themeKey)} time={fmtHM(clock)}>
          <WorkerApp />
        </IOSDevice>
      </div>
    </div>
  );
}

export function CompanyStage() {
  const [ref, scale] = useFitScale(1200, 768);
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg-2)',
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <ChromeWindow
          width={1200}
          height={768}
          url="app.rota.co/oak"
          tabs={[{ title: 'rota · Oakwood Hospitality' }]}
        >
          <CompanyApp />
        </ChromeWindow>
      </div>
    </div>
  );
}
