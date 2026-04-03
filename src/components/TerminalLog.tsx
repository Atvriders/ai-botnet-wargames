import { useEffect, useRef, CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  container: {
    height: 120,
    background: 'rgba(0,0,0,0.9)',
    borderTop: '1px solid rgba(0,255,65,0.15)',
    fontFamily: 'var(--font-terminal)',
    fontSize: 11,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 12px',
    background: 'rgba(0,255,65,0.03)',
    borderBottom: '1px solid rgba(0,255,65,0.1)',
    gap: 8,
    flexShrink: 0,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00FF41',
    boxShadow: '0 0 4px rgba(0,255,65,0.5)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  headerText: {
    fontFamily: 'var(--font-hud)',
    fontSize: 10,
    fontWeight: 600,
    color: '#337744',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  logArea: {
    flex: 1,
    overflow: 'hidden',
    padding: '4px 12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  line: {
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    animation: 'fadeIn 0.3s ease',
  },
  timestamp: {
    color: '#337744',
    marginRight: 8,
  },
  cursor: {
    display: 'inline-block',
    width: 7,
    height: 13,
    background: '#00FF41',
    marginLeft: 4,
    animation: 'blink 1s step-end infinite',
    verticalAlign: 'text-bottom',
  },
};

export interface LogEntry {
  time: string;
  text: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

interface TerminalLogProps {
  logs: LogEntry[];
}

const typeColors: Record<string, string> = {
  info: '#00FF41',
  warn: '#FFB300',
  error: '#FF0040',
  success: '#00D4FF',
};

export function TerminalLog({ logs }: TerminalLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const visibleLogs = logs.slice(-20);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerText}>Event Log // Terminal Output</span>
      </div>
      <div style={styles.logArea}>
        {visibleLogs.map((log, i) => (
          <div key={i} style={styles.line}>
            <span style={styles.timestamp}>[{log.time}]</span>
            <span style={{ color: typeColors[log.type] || '#00FF41' }}>{log.text}</span>
          </div>
        ))}
        {visibleLogs.length > 0 && (
          <div style={{ lineHeight: 1.5 }}>
            <span style={{ color: '#337744' }}>root@botnet:~$ </span>
            <span style={styles.cursor} />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
