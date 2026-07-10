import { Badge, LiveDot } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import type { Shift } from '../data/types';

export function StatusBadge({ s }: { s: Shift }) {
  if (s.status === 'active')
    return (
      <Badge tone="positive">
        <LiveDot /> On shift
      </Badge>
    );
  if (s.status === 'completed')
    return s.approved ? (
      <Badge tone="neutral">
        <Icon name="check" size={12} /> Approved
      </Badge>
    ) : (
      <Badge tone="warning">Submitted</Badge>
    );
  if (s.status === 'open') return <Badge tone="accent">Open</Badge>;
  if (s.swap) return <Badge tone="warning">Swap requested</Badge>;
  if (s.drop) return <Badge tone="danger">Drop requested</Badge>;
  return null;
}
