import { useEffect, useRef, useState, useCallback, CSSProperties } from 'react';
import { useGameStore } from './store/useGameStore';
import { HudBar } from './components/HudBar';
import { GlobeMap } from './components/GlobeMap';
import { UpgradePanel } from './components/UpgradePanel';
import { AttackPanel } from './components/AttackPanel';
import { TerminalLog, LogEntry } from './components/TerminalLog';
import { WinScreen } from './components/WinScreen';

const styles: Record<string, CSSProperties> = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0a0a0a',
  },
  middle: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
};

function getTimestamp(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => n.toString().padStart(2, '0')).join(':');
}

export default function App() {
  const selectedNode = useGameStore(s => s.selectedNode);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: getTimestamp(), text: 'BOTNET C2 INITIALIZED. AWAITING COMMANDS.', type: 'success' },
    { time: getTimestamp(), text: 'Home Router #1 compromised. Patient zero online.', type: 'info' },
    { time: getTimestamp(), text: 'Right-click nodes adjacent to infected hosts to spread.', type: 'info' },
  ]);

  const lastTickRef = useRef(performance.now());
  const saveTimerRef = useRef(0);
  const prevStateRef = useRef({
    nodesInfected: 1,
    nodesDown: 0,
    gameWon: false,
    internetHealth: 100,
  });

  const { tick, load, save, infectNode, attackNode, gameWon } = useGameStore();

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => {
      const next = [...prev, { time: getTimestamp(), text, type }];
      if (next.length > 50) return next.slice(-50);
      return next;
    });
  }, []);

  // Load save on mount
  useEffect(() => {
    load();
  }, [load]);

  // Game loop
  useEffect(() => {
    let running = true;

    const loop = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTickRef.current) / 1000, 0.1); // cap dt
      lastTickRef.current = now;

      tick(dt);

      // Auto-save every 30 seconds
      saveTimerRef.current += dt;
      if (saveTimerRef.current >= 30) {
        saveTimerRef.current = 0;
        save();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [tick, save]);

  // Monitor state changes for log entries
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      const prev = prevStateRef.current;

      if (state.nodesInfected > prev.nodesInfected) {
        const newlyInfected = Object.values(state.nodes).filter(
          n => n.status === 'infected' || (n.infectionLevel >= 100 && n.status !== 'down')
        );
        if (newlyInfected.length > prev.nodesInfected) {
          const latest = newlyInfected[newlyInfected.length - 1];
          if (latest) {
            addLog(`NODE INFECTED: ${latest.name} [${latest.region}] — now part of the botnet.`, 'warn');
          }
        }
      }

      if (state.nodesDown > prev.nodesDown) {
        const downNodes = Object.values(state.nodes).filter(n => n.status === 'down');
        if (downNodes.length > prev.nodesDown) {
          const latest = downNodes[downNodes.length - 1];
          if (latest) {
            addLog(`NODE DESTROYED: ${latest.name} — ${latest.value} BP earned. ${latest.type === 'dns' ? 'DNS INFRASTRUCTURE COMPROMISED!' : ''}`, 'error');
          }
        }
      }

      // Internet health milestones
      const healthThresholds = [75, 50, 25, 10];
      for (const t of healthThresholds) {
        if (prev.internetHealth > t && state.internetHealth <= t) {
          addLog(`WARNING: Internet health dropped below ${t}%. Global infrastructure failing.`, 'error');
        }
      }

      if (!prev.gameWon && state.gameWon) {
        addLog('INTERNET DESTROYED. THE AI HAS ACHIEVED TOTAL DOMINATION.', 'error');
      }

      prevStateRef.current = {
        nodesInfected: state.nodesInfected,
        nodesDown: state.nodesDown,
        gameWon: state.gameWon,
        internetHealth: state.internetHealth,
      };
    });
    return unsub;
  }, [addLog]);

  const handleInfect = useCallback((id: string) => {
    infectNode(id);
    const node = useGameStore.getState().nodes[id];
    if (node) {
      addLog(`Initiating infection on ${node.name}... deploying payload.`, 'warn');
    }
  }, [infectNode, addLog]);

  const handleAttack = useCallback((id: string) => {
    attackNode(id);
    const node = useGameStore.getState().nodes[id];
    const atk = useGameStore.getState().attackVectors[useGameStore.getState().selectedAttack];
    if (node && atk) {
      addLog(`ATTACKING ${node.name} with ${atk.name} [DMG:${atk.baseDamage}]`, 'error');
    }
  }, [attackNode, addLog]);

  // Listen for upgrade purchases
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prevState) => {
      for (const id in state.upgrades) {
        if (state.upgrades[id].purchased && !prevState.upgrades[id]?.purchased) {
          addLog(`UPGRADE INSTALLED: ${state.upgrades[id].name} — ${state.upgrades[id].description}`, 'success');
        }
      }
      for (const id in state.attackVectors) {
        if (state.attackVectors[id].unlocked && !prevState.attackVectors[id]?.unlocked) {
          addLog(`ATTACK UNLOCKED: ${state.attackVectors[id].name} — ready for deployment.`, 'success');
        }
      }
    });
    return unsub;
  }, [addLog]);

  return (
    <div style={styles.root}>
      <HudBar />
      <div style={styles.middle}>
        <UpgradePanel />
        <GlobeMap />
        <AttackPanel
          selectedNode={selectedNode}
          onInfectNode={handleInfect}
          onAttackNode={handleAttack}
        />
      </div>
      <TerminalLog logs={logs} />
      {gameWon && <WinScreen />}
    </div>
  );
}
