import { useEffect, useRef, useState } from 'react';
import { Avatar, Btn } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { workerById } from '../data/seed';
import { PageHeader } from './PageHeader';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

export function MessagesView({ data, actions }: { data: RotaData; actions: Actions }) {
  const [activeId, setActiveId] = useState(data.messages[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const thread = data.messages.find((m) => m.id === activeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, thread?.msgs.length]);

  const send = () => {
    if (!draft.trim()) return;
    actions.sendMessage(activeId, draft.trim());
    setDraft('');
  };

  return (
    <>
      <PageHeader title="Messages" sub="Your team" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 264, flexShrink: 0, borderRight: '1px solid var(--line)', overflowY: 'auto' }}>
          {data.messages.map((m) => {
            const w = workerById(m.workerId)!;
            const last = m.msgs[m.msgs.length - 1];
            const on = m.id === activeId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveId(m.id);
                  actions.readThread(m.id);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '13px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  background: on ? 'var(--accent-soft)' : 'transparent',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <Avatar worker={w} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{w.name}</span>
                    {m.unread && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ink-3)',
                      fontWeight: m.unread ? 700 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: 1,
                    }}
                  >
                    {last.from === 'manager' ? 'You: ' : ''}
                    {last.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {thread && (
            <>
              <div
                style={{
                  flexShrink: 0,
                  padding: '13px 20px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                }}
              >
                <Avatar worker={workerById(thread.workerId)!} size={36} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>
                    {workerById(thread.workerId)!.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--positive)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--positive)' }} /> Active
                  </div>
                </div>
              </div>
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {thread.msgs.map((msg, i) => {
                  const mine = msg.from === 'manager';
                  return (
                    <div key={i} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 16,
                          fontSize: 14,
                          fontWeight: 500,
                          lineHeight: 1.4,
                          background: mine ? 'var(--accent)' : 'var(--surface)',
                          color: mine ? 'var(--accent-ink)' : 'var(--ink)',
                          border: mine ? 'none' : '1px solid var(--line)',
                          borderBottomRightRadius: mine ? 5 : 16,
                          borderBottomLeftRadius: mine ? 16 : 5,
                        }}
                      >
                        {msg.text}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          fontWeight: 600,
                          marginTop: 3,
                          textAlign: mine ? 'right' : 'left',
                        }}
                      >
                        {msg.t}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  flexShrink: 0,
                  padding: '14px 20px',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Message…"
                  style={{
                    flex: 1,
                    border: '1px solid var(--line-2)',
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <Btn variant="primary" onClick={send} style={{ padding: '11px 14px' }}>
                  <Icon name="send" size={17} />
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
