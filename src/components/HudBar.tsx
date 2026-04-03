import { CSSProperties } from 'react';
import { useGameStore } from '../store/useGameStore';

const styles: Record<string, CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    height: 48,
    background: 'linear-gradient(180deg, #0c1218 0%, #0a0f14 100%)',
    borderBottom: '1px solid rgba(0,255,65,0.15)',
    padding: '0 16px',
    gap: 0,
    fontFamily: 'var(--font-hud)',
    position: 'relative',
    zIndex: 10,
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-hud)',
    fontSize: 18,
    fontWeight: 700,
    color: '#00FF41',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textShadow: '0 0 10px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.3)',
    marginRight: 24,
    whiteSpace: 'nowrap',
    animation: 'glow 3s ease-in-out infinite',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    overflow: 'hidden',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    minWidth: 70,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#337744',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  healthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
  },
  healthBar: {
    flex: 1,
    height: 14,
    background: '#0a0a0a',
    border: '1px solid rgba(0,255,65,0.2)',
    borderRadius: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  healthFill: {
    height: '100%',
    transition: 'width 0.5s ease, background 0.5s ease',
    position: 'relative',
  },
  healthLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#337744',
    textTransform: 'uppercase',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  },
  healthPct: {
    fontSize: 13,
    fontWeight: 700,
    minWidth: 40,
    textAlign: 'right',
  },
  autoBtn: {
    fontSize: 10,
    fontFamily: 'var(--font-terminal)',
    padding: '4px 10px',
    border: '1px solid rgba(0,255,65,0.2)',
    background: '#0d1117',
    color: '#00FF41',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
    whiteSpace: 'nowrap',
  },
  separator: {
    width: 1,
    height: 28,
    background: 'rgba(0,255,65,0.15)',
    flexShrink: 0,
    margin: '0 4px',
  },
};

function formatBP(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export function HudBar() {
  const {
    botPower, botsActive, maxBots, bandwidth,
    internetHealth, nodesInfected, nodesDown, totalNodes,
    waveNumber, autoTargeting, toggleAutoTarget,
  } = useGameStore();

  const healthColor =
    internetHealth > 60 ? '#00FF41' :
    internetHealth > 30 ? '#FFB300' :
    '#FF0040';

  const healthGlow =
    internetHealth > 60 ? 'rgba(0,255,65,0.3)' :
    internetHealth > 30 ? 'rgba(255,179,0,0.3)' :
    'rgba(255,0,64,0.3)';

  return (
    <div style={styles.bar}>
      <div style={styles.title}>AI BOTNET WARGAMES</div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>BotPower</span>
          <span style={{ ...styles.statValue, color: '#00FF41' }}>{formatBP(botPower)} BP</span>
        </div>
        <div style={styles.separator} />

        <div style={styles.stat}>
          <span style={styles.statLabel}>Bots</span>
          <span style={{ ...styles.statValue, color: '#00D4FF' }}>{botsActive}/{maxBots}</span>
        </div>
        <div style={styles.separator} />

        <div style={styles.stat}>
          <span style={styles.statLabel}>Bandwidth</span>
          <span style={{ ...styles.statValue, color: '#00D4FF' }}>{bandwidth.toFixed(1)} Gbps</span>
        </div>
        <div style={styles.separator} />

        <div style={styles.stat}>
          <span style={styles.statLabel}>Wave</span>
          <span style={{ ...styles.statValue, color: '#FFB300' }}>{waveNumber}</span>
        </div>
        <div style={styles.separator} />

        <div style={styles.stat}>
          <span style={styles.statLabel}>Nodes</span>
          <span style={{ ...styles.statValue, color: '#FF0040' }}>
            {nodesInfected}<span style={{ color: '#337744', fontSize: 11 }}>/</span>
            {nodesDown}<span style={{ color: '#337744', fontSize: 11 }}>/</span>
            {totalNodes}
          </span>
        </div>
        <div style={styles.separator} />

        <div style={styles.healthContainer}>
          <span style={styles.healthLabel}>Internet Health</span>
          <div style={styles.healthBar as any}>
            <div style={{
              ...styles.healthFill,
              width: `${internetHealth}%`,
              background: `linear-gradient(90deg, ${healthColor}, ${healthColor}88)`,
              boxShadow: `0 0 8px ${healthGlow}`,
            }} />
          </div>
          <span style={{ ...styles.healthPct, color: healthColor }}>
            {internetHealth.toFixed(1)}%
          </span>
        </div>
      </div>

      <button
        style={{
          ...styles.autoBtn,
          borderColor: autoTargeting ? '#00FF41' : 'rgba(0,255,65,0.2)',
          background: autoTargeting ? 'rgba(0,255,65,0.1)' : '#0d1117',
          boxShadow: autoTargeting ? '0 0 8px rgba(0,255,65,0.2)' : 'none',
        }}
        onClick={toggleAutoTarget}
      >
        {autoTargeting ? '[ AUTO: ON ]' : '[ AUTO: OFF ]'}
      </button>
    </div>
  );
}
