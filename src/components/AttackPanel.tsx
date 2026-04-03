import { CSSProperties } from 'react';
import { useGameStore } from '../store/useGameStore';
import { NetworkNode, AttackVector } from '../types';

const TYPE_COLORS: Record<string, string> = {
  ddos: '#FF0040',
  exploit: '#FFB300',
  worm: '#00FF41',
  ransomware: '#cc00ff',
  apt: '#00D4FF',
};

const styles: Record<string, CSSProperties> = {
  panel: {
    width: 280,
    background: '#0c1218',
    borderLeft: '1px solid rgba(0,255,65,0.15)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sectionHeader: {
    fontFamily: 'var(--font-hud)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '8px 12px',
    borderBottom: '1px solid',
    flexShrink: 0,
  },
  attackList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
    minHeight: 0,
  },
  attackItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 8px',
    marginBottom: 2,
    border: '1px solid rgba(255,0,64,0.1)',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  attackIcon: {
    fontSize: 14,
    flexShrink: 0,
  },
  attackInfo: {
    flex: 1,
    minWidth: 0,
  },
  attackName: {
    fontSize: 11,
    fontFamily: 'var(--font-hud)',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  attackMeta: {
    fontSize: 9,
    color: '#553333',
    display: 'flex',
    gap: 8,
    marginTop: 1,
  },
  typeBadge: {
    fontSize: 8,
    padding: '1px 4px',
    borderRadius: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 700,
    fontFamily: 'var(--font-hud)',
  },
  unlockBtn: {
    fontSize: 9,
    fontFamily: 'var(--font-terminal)',
    padding: '2px 6px',
    border: '1px solid rgba(255,0,64,0.3)',
    background: 'rgba(255,0,64,0.1)',
    color: '#FF0040',
    cursor: 'pointer',
    flexShrink: 0,
  },
  nodeInfo: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '3px 0',
    borderBottom: '1px solid rgba(0,255,65,0.05)',
    fontSize: 11,
  },
  infoLabel: {
    color: '#337744',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    color: '#00FF41',
    fontWeight: 600,
    textAlign: 'right',
  },
  healthBarOuter: {
    width: '100%',
    height: 8,
    background: '#0a0a0a',
    border: '1px solid rgba(0,255,65,0.15)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  actionBtns: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    padding: '6px 8px',
    fontSize: 11,
    fontFamily: 'var(--font-terminal)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    border: '1px solid',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s',
  },
  noSelection: {
    padding: 20,
    textAlign: 'center',
    color: '#337744',
    fontSize: 11,
    fontStyle: 'italic',
  },
  connList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  connChip: {
    fontSize: 8,
    padding: '2px 5px',
    border: '1px solid rgba(0,255,65,0.15)',
    color: '#337744',
    background: 'rgba(0,0,0,0.3)',
  },
};

interface AttackPanelProps {
  selectedNode: string | null;
  onInfectNode: (id: string) => void;
  onAttackNode: (id: string) => void;
}

export function AttackPanel({ selectedNode, onInfectNode, onAttackNode }: AttackPanelProps) {
  const {
    attackVectors, selectedAttack, selectAttack, unlockAttack,
    botPower, nodes, attackCooldown,
  } = useGameStore();

  const node: NetworkNode | null = selectedNode ? nodes[selectedNode] || null : null;
  const attacks = Object.values(attackVectors);
  const unlocked = attacks.filter(a => a.unlocked);
  const locked = attacks.filter(a => !a.unlocked);

  const canInfect = node && node.status !== 'down' && node.infectionLevel === 0 &&
    node.connections.some(cid => {
      const c = nodes[cid];
      return c && (c.status === 'infected' || c.infectionLevel >= 50);
    });

  const canAttack = node && node.status !== 'down' && node.infectionLevel >= 50 && attackCooldown <= 0;

  return (
    <div style={styles.panel}>
      {/* Attack Vectors Section */}
      <div style={{ ...styles.section, maxHeight: node ? '45%' : '100%' }}>
        <div style={{
          ...styles.sectionHeader,
          color: '#FF0040',
          borderBottomColor: 'rgba(255,0,64,0.15)',
          background: 'rgba(255,0,64,0.03)',
          textShadow: '0 0 8px rgba(255,0,64,0.3)',
        }}>
          Attack Vectors
        </div>
        <div style={styles.attackList}>
          {unlocked.map(atk => (
            <AttackItem
              key={atk.id}
              attack={atk}
              isSelected={selectedAttack === atk.id}
              onSelect={() => selectAttack(atk.id)}
            />
          ))}
          {locked.length > 0 && (
            <div style={{
              fontSize: 9, color: '#333', padding: '6px 4px',
              textTransform: 'uppercase', letterSpacing: 1,
              fontFamily: 'var(--font-hud)',
            }}>
              Locked
            </div>
          )}
          {locked.map(atk => (
            <div key={atk.id} style={{
              ...styles.attackItem,
              opacity: 0.4,
              cursor: botPower >= atk.cost ? 'pointer' : 'not-allowed',
            }}>
              <span style={styles.attackIcon}>{atk.icon}</span>
              <div style={styles.attackInfo}>
                <div style={{ ...styles.attackName, color: '#555' }}>{atk.name}</div>
                <div style={styles.attackMeta}>
                  <span>DMG:{atk.baseDamage}</span>
                  <span>CD:{atk.cooldown}s</span>
                </div>
              </div>
              <button
                style={{
                  ...styles.unlockBtn,
                  opacity: botPower >= atk.cost ? 1 : 0.4,
                }}
                onClick={() => botPower >= atk.cost && unlockAttack(atk.id)}
                disabled={botPower < atk.cost}
              >
                {atk.cost >= 1000 ? (atk.cost / 1000).toFixed(0) + 'K' : atk.cost} BP
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Target Info Section */}
      <div style={{ ...styles.section, flex: 1, borderTop: '1px solid rgba(0,212,255,0.15)', minHeight: 0 }}>
        <div style={{
          ...styles.sectionHeader,
          color: '#00D4FF',
          borderBottomColor: 'rgba(0,212,255,0.15)',
          background: 'rgba(0,212,255,0.03)',
          textShadow: '0 0 8px rgba(0,212,255,0.3)',
        }}>
          Target Info
        </div>
        {node ? (
          <div style={styles.nodeInfo}>
            <div style={{
              fontSize: 14, fontFamily: 'var(--font-hud)', fontWeight: 700,
              color: node.status === 'down' ? '#555' :
                     node.status === 'infected' ? '#FFB300' :
                     node.status === 'attacking' ? '#FF0040' : '#00FF41',
              marginBottom: 6,
              textShadow: node.status === 'down' ? 'none' : `0 0 8px ${STATUS_GLOW[node.status] || 'rgba(0,255,65,0.3)'}`,
            }}>
              {node.name}
            </div>

            <InfoRow label="Type" value={node.type.toUpperCase()} />
            <InfoRow label="Status" value={node.status.toUpperCase()} color={
              node.status === 'down' ? '#555' :
              node.status === 'infected' ? '#FFB300' :
              node.status === 'attacking' ? '#FF0040' : '#00FF41'
            } />
            <InfoRow label="Region" value={node.region} />
            <InfoRow label="Importance" value={`${node.importance}/10`} color="#FFB300" />
            <InfoRow label="Defense" value={String(node.defense)} />
            <InfoRow label="Bandwidth" value={`${node.bandwidth} Gbps`} color="#00D4FF" />
            <InfoRow label="Value" value={`${node.value} BP`} color="#00FF41" />

            {/* Health bar */}
            <div style={{ ...styles.infoLabel, marginTop: 6 }}>
              Health: {node.health}/{node.maxHealth}
            </div>
            <div style={styles.healthBarOuter}>
              <div style={{
                ...styles.healthBarFill,
                width: `${(node.health / node.maxHealth) * 100}%`,
                background: node.health / node.maxHealth > 0.5 ? '#00FF41' :
                             node.health / node.maxHealth > 0.25 ? '#FFB300' : '#FF0040',
              }} />
            </div>

            {/* Infection bar */}
            <div style={{ ...styles.infoLabel }}>
              Infection: {node.infectionLevel.toFixed(0)}%
            </div>
            <div style={styles.healthBarOuter}>
              <div style={{
                ...styles.healthBarFill,
                width: `${node.infectionLevel}%`,
                background: node.infectionLevel >= 100 ? '#FFB300' :
                             `linear-gradient(90deg, #FF0040, #FFB300)`,
              }} />
            </div>

            {/* Description */}
            <div style={{ fontSize: 10, color: '#337744', marginTop: 6, lineHeight: 1.4, fontStyle: 'italic' }}>
              {node.description}
            </div>

            {/* Connections */}
            <div style={{ ...styles.infoLabel, marginTop: 8 }}>Connections</div>
            <div style={styles.connList}>
              {node.connections.map(cid => {
                const c = nodes[cid];
                return (
                  <span key={cid} style={{
                    ...styles.connChip,
                    color: c?.status === 'down' ? '#444' :
                           c?.status === 'infected' ? '#FFB300' : '#337744',
                    borderColor: c?.status === 'down' ? 'rgba(80,80,80,0.15)' :
                                 c?.status === 'infected' ? 'rgba(255,179,0,0.2)' : 'rgba(0,255,65,0.15)',
                  }}>
                    {c?.name || cid}
                  </span>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={styles.actionBtns}>
              <button
                style={{
                  ...styles.actionBtn,
                  borderColor: canInfect ? '#00FF41' : 'rgba(0,255,65,0.15)',
                  color: canInfect ? '#00FF41' : '#333',
                  background: canInfect ? 'rgba(0,255,65,0.08)' : 'transparent',
                }}
                disabled={!canInfect}
                onClick={() => canInfect && onInfectNode(node.id)}
              >
                Infect
              </button>
              <button
                style={{
                  ...styles.actionBtn,
                  borderColor: canAttack ? '#FF0040' : 'rgba(255,0,64,0.15)',
                  color: canAttack ? '#FF0040' : '#333',
                  background: canAttack ? 'rgba(255,0,64,0.08)' : 'transparent',
                }}
                disabled={!canAttack}
                onClick={() => canAttack && onAttackNode(node.id)}
              >
                Attack
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.noSelection}>
            Select a node on the map to view details.
            <br /><br />
            <span style={{ color: '#224422', fontSize: 9 }}>
              Left-click: Select &bull; Right-click: Infect/Attack
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_GLOW: Record<string, string> = {
  online: 'rgba(0,255,65,0.3)',
  infected: 'rgba(255,179,0,0.3)',
  attacking: 'rgba(255,0,64,0.3)',
  down: 'none',
};

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={{ ...styles.infoValue, color: color || '#00FF41' }}>{value}</span>
    </div>
  );
}

function AttackItem({ attack, isSelected, onSelect }: { attack: AttackVector; isSelected: boolean; onSelect: () => void }) {
  const typeColor = TYPE_COLORS[attack.type] || '#FF0040';
  return (
    <div
      style={{
        ...styles.attackItem,
        borderColor: isSelected ? typeColor : 'rgba(255,0,64,0.1)',
        background: isSelected ? `${typeColor}11` : 'rgba(0,0,0,0.3)',
        boxShadow: isSelected ? `0 0 8px ${typeColor}33` : 'none',
      }}
      onClick={onSelect}
    >
      <span style={styles.attackIcon}>{attack.icon}</span>
      <div style={styles.attackInfo}>
        <div style={{
          ...styles.attackName,
          color: isSelected ? typeColor : '#aa5555',
        }}>
          {attack.name}
        </div>
        <div style={styles.attackMeta}>
          <span style={{ color: '#FF0040' }}>DMG:{attack.baseDamage}</span>
          <span>CD:{attack.cooldown}s</span>
          <span style={{
            ...styles.typeBadge,
            color: typeColor,
            border: `1px solid ${typeColor}44`,
          }}>
            {attack.type}
          </span>
        </div>
      </div>
    </div>
  );
}
