import { create } from 'zustand';
import { GameState, NetworkNode } from '../types';
import { initialNodes } from '../data/nodes';
import { INITIAL_UPGRADES } from '../data/upgrades';
import { INITIAL_ATTACKS } from '../data/attacks';

const buildNodeMap = (): Record<string, NetworkNode> => {
  const map: Record<string, NetworkNode> = {};
  for (const n of initialNodes) map[n.id] = { ...n };
  return map;
};

const SAVE_KEY = 'ai-botnet-wargames-save';

export const useGameStore = create<GameState>((set, get) => ({
  botPower: 0,
  totalBotPower: 0,
  botsActive: 1,
  maxBots: 50,
  bandwidth: 1,
  attackMultiplier: 1,
  spreadMultiplier: 1,
  stealthLevel: 1,
  evolutionLevel: 0,
  nodes: buildNodeMap(),
  activeAttack: null,
  attackProgress: 0,
  attackCooldown: 0,
  nodesInfected: 1,
  nodesDown: 0,
  totalNodes: initialNodes.length,
  internetHealth: 100,
  waveNumber: 1,
  upgrades: JSON.parse(JSON.stringify(INITIAL_UPGRADES)),
  attackVectors: JSON.parse(JSON.stringify(INITIAL_ATTACKS)),
  selectedAttack: 'synFlood',
  gameStarted: true,
  gameWon: false,
  message: '',
  messageTimer: 0,
  autoTargeting: false,

  tick: (dt: number) => {
    const s = get();
    if (s.gameWon) return;

    // Passive BotPower generation from infected nodes
    let bpPerSec = 0;
    const nodes = { ...s.nodes };
    let infected = 0;
    let down = 0;
    let totalImportance = 0;
    let downImportance = 0;

    for (const id in nodes) {
      const n = nodes[id];
      totalImportance += n.importance;
      if (n.status === 'down') {
        down++;
        downImportance += n.importance;
      }
      if (n.status === 'infected' || n.infectionLevel >= 100) {
        infected++;
        bpPerSec += n.bandwidth * 0.5 * s.attackMultiplier;
      }
      if (n.infectionLevel > 0 && n.infectionLevel < 100 && n.status === 'online') {
        // Infection spreading within node
        const newLevel = Math.min(100, n.infectionLevel + dt * 2 * s.spreadMultiplier);
        nodes[id] = { ...n, infectionLevel: newLevel };
        if (newLevel >= 100) {
          nodes[id].status = 'infected';
        }
      }
    }

    // Auto-spread infection to adjacent nodes
    for (const id in nodes) {
      const n = nodes[id];
      if ((n.status === 'infected' || n.infectionLevel >= 50) && n.status !== 'down') {
        for (const connId of n.connections) {
          const target = nodes[connId];
          if (target && target.status === 'online' && target.infectionLevel === 0) {
            const spreadChance = dt * 0.02 * s.spreadMultiplier * (s.stealthLevel / (target.defense || 1));
            if (Math.random() < spreadChance) {
              nodes[connId] = { ...target, infectionLevel: 1 };
            }
          }
        }
      }
    }

    // Process active attack
    let activeAttack = s.activeAttack;
    let attackProgress = s.attackProgress;
    let cooldown = Math.max(0, s.attackCooldown - dt);

    if (activeAttack && nodes[activeAttack]) {
      const target = nodes[activeAttack];
      if (target.status === 'down') {
        activeAttack = null;
        attackProgress = 0;
      } else {
        const atk = s.attackVectors[s.selectedAttack];
        const dmg = (atk?.baseDamage || 5) * s.attackMultiplier * dt;
        const effectiveDmg = Math.max(1, dmg - target.defense * 0.1);
        const newHealth = Math.max(0, target.health - effectiveDmg);
        attackProgress = Math.min(100, ((target.maxHealth - newHealth) / target.maxHealth) * 100);

        if (newHealth <= 0) {
          nodes[activeAttack] = { ...target, health: 0, status: 'down', infectionLevel: 100 };
          down++;
          downImportance += target.importance;
          activeAttack = null;
          attackProgress = 0;
        } else {
          nodes[activeAttack] = { ...target, health: newHealth, status: target.infectionLevel >= 100 ? 'infected' : 'attacking' };
        }
      }
    }

    // Auto-targeting
    if (s.autoTargeting && !activeAttack && cooldown <= 0) {
      const candidates = Object.values(nodes).filter(
        n => n.status !== 'down' && n.infectionLevel >= 50
      );
      if (candidates.length > 0) {
        candidates.sort((a, b) => a.health - b.health);
        activeAttack = candidates[0].id;
        const atk = s.attackVectors[s.selectedAttack];
        cooldown = atk?.cooldown || 3;
      }
    }

    const internetHealth = Math.max(0, 100 - (downImportance / totalImportance) * 100);
    const bp = bpPerSec * dt;
    const newBP = s.botPower + bp;
    const wave = Math.floor(down / 5) + 1;

    set({
      nodes,
      botPower: newBP,
      totalBotPower: s.totalBotPower + bp,
      nodesInfected: infected,
      nodesDown: down,
      internetHealth,
      waveNumber: wave,
      activeAttack,
      attackProgress,
      attackCooldown: cooldown,
      botsActive: Math.min(s.maxBots, infected * 5 + 1),
      gameWon: internetHealth <= 0,
    });
  },

  infectNode: (id: string) => {
    const s = get();
    const node = s.nodes[id];
    if (!node || node.status === 'down') return;

    // Check adjacency to an infected node
    const hasAdjacentInfected = node.connections.some(connId => {
      const conn = s.nodes[connId];
      return conn && (conn.status === 'infected' || conn.infectionLevel >= 50);
    });
    if (!hasAdjacentInfected && node.infectionLevel === 0) return;

    if (node.infectionLevel === 0) {
      set({
        nodes: { ...s.nodes, [id]: { ...node, infectionLevel: 1 } },
      });
    }
  },

  attackNode: (id: string) => {
    const s = get();
    const node = s.nodes[id];
    if (!node || node.status === 'down') return;
    if (s.attackCooldown > 0) return;

    const atk = s.attackVectors[s.selectedAttack];
    set({
      activeAttack: id,
      attackProgress: 0,
      attackCooldown: atk?.cooldown || 3,
    });
  },

  buyUpgrade: (id: string) => {
    const s = get();
    const upg = s.upgrades[id];
    if (!upg || upg.purchased || s.botPower < upg.cost) return;
    if (upg.requires && !s.upgrades[upg.requires]?.purchased) return;

    const newUpgrades = { ...s.upgrades, [id]: { ...upg, purchased: true } };
    let newState: Partial<GameState> = {
      upgrades: newUpgrades,
      botPower: s.botPower - upg.cost,
    };

    switch (upg.effect) {
      case 'attackPower': newState.attackMultiplier = s.attackMultiplier * upg.effectValue; break;
      case 'spreadSpeed': newState.spreadMultiplier = s.spreadMultiplier * upg.effectValue; break;
      case 'stealth': newState.stealthLevel = s.stealthLevel * upg.effectValue; break;
      case 'bandwidth': newState.bandwidth = s.bandwidth + upg.effectValue; break;
      case 'botCount': newState.maxBots = s.maxBots + upg.effectValue; break;
      case 'evolution': newState.evolutionLevel = s.evolutionLevel + upg.effectValue; break;
      case 'persistence': break;
    }
    set(newState as any);
  },

  unlockAttack: (id: string) => {
    const s = get();
    const atk = s.attackVectors[id];
    if (!atk || atk.unlocked || s.botPower < atk.cost) return;
    set({
      attackVectors: { ...s.attackVectors, [id]: { ...atk, unlocked: true } },
      botPower: s.botPower - atk.cost,
    });
  },

  selectAttack: (id: string) => set({ selectedAttack: id }),
  toggleAutoTarget: () => set({ autoTargeting: !get().autoTargeting }),
  setMessage: (msg: string) => set({ message: msg, messageTimer: 3 }),

  save: () => {
    const s = get();
    const data = {
      botPower: s.botPower,
      totalBotPower: s.totalBotPower,
      botsActive: s.botsActive,
      maxBots: s.maxBots,
      bandwidth: s.bandwidth,
      attackMultiplier: s.attackMultiplier,
      spreadMultiplier: s.spreadMultiplier,
      stealthLevel: s.stealthLevel,
      evolutionLevel: s.evolutionLevel,
      nodes: s.nodes,
      nodesInfected: s.nodesInfected,
      nodesDown: s.nodesDown,
      internetHealth: s.internetHealth,
      waveNumber: s.waveNumber,
      upgrades: s.upgrades,
      attackVectors: s.attackVectors,
      selectedAttack: s.selectedAttack,
      autoTargeting: s.autoTargeting,
      gameWon: s.gameWon,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        ...data,
        gameStarted: true,
        message: '',
        messageTimer: 0,
        activeAttack: null,
        attackProgress: 0,
        attackCooldown: 0,
      });
    } catch { /* ignore corrupt saves */ }
  },
}));
