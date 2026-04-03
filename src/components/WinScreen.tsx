import { CSSProperties } from 'react';
import { useGameStore } from '../store/useGameStore';

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000,
    fontFamily: 'var(--font-hud)',
  },
  title: {
    fontSize: 64,
    fontWeight: 700,
    color: '#FF0040',
    textTransform: 'uppercase',
    letterSpacing: 12,
    animation: 'glitch 0.3s ease-in-out infinite, glow-red 2s ease-in-out infinite',
    textShadow: '0 0 20px rgba(255,0,64,0.8), 0 0 40px rgba(255,0,64,0.4), 0 0 80px rgba(255,0,64,0.2)',
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#aa0033',
    letterSpacing: 4,
    marginBottom: 40,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  statsBox: {
    background: 'rgba(255,0,64,0.05)',
    border: '1px solid rgba(255,0,64,0.2)',
    padding: '24px 40px',
    marginBottom: 40,
    minWidth: 300,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,0,64,0.08)',
    fontSize: 15,
    fontFamily: 'var(--font-terminal)',
  },
  statLabel: {
    color: '#663333',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statValue: {
    color: '#FF0040',
    fontWeight: 700,
  },
  restartBtn: {
    fontSize: 15,
    fontFamily: 'var(--font-terminal)',
    padding: '12px 40px',
    border: '2px solid #FF0040',
    background: 'rgba(255,0,64,0.1)',
    color: '#FF0040',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 3,
    transition: 'all 0.2s',
  },
  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,64,0.02) 2px, rgba(255,0,64,0.02) 4px)',
    pointerEvents: 'none',
  },
};

export function WinScreen() {
  const { totalBotPower, nodesDown, totalNodes } = useGameStore();

  const handleRestart = () => {
    localStorage.removeItem('ai-botnet-wargames-save');
    window.location.reload();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.scanlineOverlay} />
      <div style={styles.title}>
        INTERNET<br />DESTROYED
      </div>
      <div style={styles.subtitle}>
        "The AI has won. Humanity is offline."
      </div>
      <div style={styles.statsBox}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Nodes Destroyed</span>
          <span style={styles.statValue}>{nodesDown} / {totalNodes}</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Total BotPower</span>
          <span style={styles.statValue}>
            {totalBotPower >= 1e6 ? (totalBotPower / 1e6).toFixed(2) + 'M' :
             totalBotPower >= 1e3 ? (totalBotPower / 1e3).toFixed(1) + 'K' :
             Math.floor(totalBotPower)} BP
          </span>
        </div>
        <div style={{ ...styles.statRow, borderBottom: 'none' }}>
          <span style={styles.statLabel}>Status</span>
          <span style={{ ...styles.statValue, color: '#00FF41' }}>TOTAL DOMINATION</span>
        </div>
      </div>
      <button
        style={styles.restartBtn}
        onClick={handleRestart}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,0,64,0.25)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,64,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,0,64,0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        [ RESTART SIMULATION ]
      </button>
    </div>
  );
}
