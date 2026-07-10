import { Card } from '../ui/primitives';

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <Card style={{ textAlign: 'center', padding: '34px 18px' }}>
      <div style={{ color: 'var(--ink-2)', fontSize: 15, fontWeight: 700 }}>{title}</div>
      <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}
