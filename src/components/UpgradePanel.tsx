import { CSSProperties, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BotnetUpgrade } from '../types';

const TIER_NAMES: Record<number, string> = {
  1: 'SCRIPT KIDDIE',
  2: 'HACKER',
  3: 'APT OPERATOR',
  4: 'NATION STATE',
  5: 'CYBER WEAPON',
  6: 'DIGITAL GOD',
  7: 'DIGITAL APOCALYPSE',
  8: 'BEYOND',
};

const styles: Record<string, CSSProperties> = {
  panel: {
    width: 250,
    background: '#0c1218',
    borderRight: '1px solid rgba(0,255,65,0.15)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  header: {
    fontFamily: 'var(--font-hud)',
    fontSize: 12,
    fontWeight: 700,
    color: '#FFB300',
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255,179,0,0.15)',
    background: 'rgba(255,179,0,0.03)',
    textShadow: '0 0 8px rgba(255,179,0,0.3)',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  tierHeader: {
    fontFamily: 'var(--font-hud)',
    fontSize: 11,
    fontWeight: 700,
    color: '#337744',
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '10px 4px 4px',
    borderBottom: '1px solid rgba(0,255,65,0.08)',
    marginBottom: 4,
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '6px 8px',
    marginBottom: 2,
    border: '1px solid rgba(0,255,65,0.12)',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  icon: {
    fontSize: 16,
    lineHeight: 1,
    flexShrink: 0,
    marginTop: 1,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'var(--font-hud)',
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  desc: {
    fontSize: 11,
    color: '#337744',
    lineHeight: 1.3,
    marginTop: 1,
  },
  cost: {
    fontSize: 11,
    fontFamily: 'var(--font-terminal)',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  locked: {
    fontSize: 11,
    color: '#553300',
    fontStyle: 'italic',
    marginTop: 2,
  },
};

export function UpgradePanel() {
  const { upgrades, botPower, buyUpgrade } = useGameStore();

  const grouped = useMemo(() => {
    const tiers: Record<number, BotnetUpgrade[]> = {};
    for (const upg of Object.values(upgrades)) {
      if (!tiers[upg.tier]) tiers[upg.tier] = [];
      tiers[upg.tier].push(upg);
    }
    return tiers;
  }, [upgrades]);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>Botnet Upgrades</div>
      <div style={styles.list}>
        {Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0])).map(([tier, items]) => (
          <div key={tier}>
            <div style={styles.tierHeader}>
              Tier {tier} &mdash; {TIER_NAMES[Number(tier)] || '???'}
            </div>
            {items.map(upg => {
              const canAfford = botPower >= upg.cost;
              const prereqMet = !upg.requires || upgrades[upg.requires]?.purchased;
              const available = canAfford && prereqMet && !upg.purchased;

              return (
                <div
                  key={upg.id}
                  style={{
                    ...styles.item,
                    borderColor: upg.purchased ? 'rgba(0,255,65,0.15)' :
                                 available ? '#00FF41' :
                                 !prereqMet ? 'rgba(80,80,80,0.2)' :
                                 'rgba(0,255,65,0.08)',
                    opacity: upg.purchased ? 0.5 : !prereqMet ? 0.35 : 1,
                    cursor: available ? 'pointer' : upg.purchased ? 'default' : 'not-allowed',
                    background: upg.purchased ? 'rgba(0,255,65,0.03)' :
                                available ? 'rgba(0,255,65,0.05)' :
                                'rgba(0,0,0,0.3)',
                  }}
                  onClick={() => available && buyUpgrade(upg.id)}
                  onMouseEnter={e => {
                    if (available) (e.currentTarget.style.boxShadow = '0 0 8px rgba(0,255,65,0.2)');
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={styles.icon}>{upg.icon}</span>
                  <div style={styles.info}>
                    <div style={{
                      ...styles.name,
                      color: upg.purchased ? '#337744' :
                             available ? '#00FF41' :
                             '#557755',
                    }}>
                      {upg.name}
                      {upg.purchased && <span style={{ color: '#337744', marginLeft: 4 }}>[INSTALLED]</span>}
                    </div>
                    <div style={styles.desc}>{upg.description}</div>
                    {!prereqMet && upg.requires && (
                      <div style={styles.locked}>
                        Requires: {upgrades[upg.requires]?.name || upg.requires}
                      </div>
                    )}
                  </div>
                  {!upg.purchased && (
                    <span style={{
                      ...styles.cost,
                      color: canAfford ? '#00FF41' : '#553333',
                    }}>
                      {upg.cost >= 1000000 ? (upg.cost / 1000000).toFixed(1) + 'M' :
                       upg.cost >= 1000 ? (upg.cost / 1000).toFixed(0) + 'K' :
                       upg.cost} BP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
