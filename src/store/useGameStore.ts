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
const AUTO_SAVE_INTERVAL = 30; // seconds

export function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(1) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

/** Collect all unique regions from node data */
function getAllRegions(nodes: Record<string, NetworkNode>): string[] {
  const regions = new Set<string>();
  for (const id in nodes) regions.add(nodes[id].region);
  return Array.from(regions);
}

/** Check if a region is conquered (all nodes infected or down) */
function isRegionConquered(region: string, nodes: Record<string, NetworkNode>): boolean {
  for (const id in nodes) {
    const n = nodes[id];
    if (n.region === region && n.status !== 'infected' && n.status !== 'down') {
      return false;
    }
  }
  return true;
}

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
  counterAttackTimer: 60,
  conqueredRegions: [],
  selectedNode: null,
  saveTimer: 0,

  tick: (dt: number) => {
    const s = get();
    if (s.gameWon) return;

    // Passive BotPower generation from infected nodes
    let bpPerSec = 0;
    const nodes = { ...s.nodes };
    let infected = 0;
    let down = 0;
    let totalImportance = 0;
    let activeImportance = 0;

    for (const id in nodes) {
      const n = nodes[id];
      totalImportance += n.importance;
      if (n.status !== 'down') {
        activeImportance += n.importance;
      }
      if (n.status === 'down') {
        down++;
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

    // --- Counter-attack waves ---
    let counterAttackTimer = s.counterAttackTimer - dt;
    let msg = s.message;
    let msgTimer = Math.max(0, s.messageTimer - dt);
    const hasPersistence = s.upgrades['persistence']?.purchased;

    if (counterAttackTimer <= 0 && !hasPersistence) {
      // Defenders try to clean up 1-3 random infected nodes
      const infectedNodes = Object.values(nodes).filter(n => n.status === 'infected');
      const cleanCount = Math.min(infectedNodes.length, Math.floor(Math.random() * 3) + 1);
      if (cleanCount > 0) {
        // Shuffle and pick
        const shuffled = infectedNodes.sort(() => Math.random() - 0.5).slice(0, cleanCount);
        for (const target of shuffled) {
          const newLevel = Math.max(0, target.infectionLevel - 10);
          nodes[target.id] = {
            ...nodes[target.id],
            infectionLevel: newLevel,
            status: newLevel >= 100 ? 'infected' : newLevel > 0 ? 'online' : 'online',
          };
        }
        msg = `Counter-attack! Defenders cleaned ${cleanCount} node${cleanCount > 1 ? 's' : ''} (-10% infection)`;
        msgTimer = 4;
      }
      // Reset timer — higher stealth = less frequent counter-attacks
      counterAttackTimer = 60 / s.stealthLevel;
    }

    // --- Region conquest bonuses ---
    let attackMultiplier = s.attackMultiplier;
    const conqueredRegions = [...s.conqueredRegions];
    const allRegions = getAllRegions(nodes);
    for (const region of allRegions) {
      if (!conqueredRegions.includes(region) && isRegionConquered(region, nodes)) {
        conqueredRegions.push(region);
        attackMultiplier *= 1.1; // +10% permanent bonus
        msg = `Region conquered: ${region}! +10% attack power!`;
        msgTimer = 5;
      }
    }

    // Internet health weighted by importance
    // activeImportance is sum of importance where status != 'down'
    const internetHealth = totalImportance > 0
      ? Math.max(0, (activeImportance / totalImportance) * 100)
      : 0;

    const bp = bpPerSec * dt;
    const newBP = s.botPower + bp;
    const wave = Math.floor(down / 5) + 1;

    // Auto-save timer
    let saveTimer = s.saveTimer + dt;
    if (saveTimer >= AUTO_SAVE_INTERVAL) {
      saveTimer = 0;
      // Schedule save after state update
      setTimeout(() => get().save(), 0);
    }

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
      counterAttackTimer,
      conqueredRegions,
      attackMultiplier,
      message: msg,
      messageTimer: msgTimer,
      saveTimer,
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
      case 'persistence': break; // persistence is checked by flag in counter-attack logic
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
  selectNode: (id: string | null) => set({ selectedNode: id }),
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
      counterAttackTimer: s.counterAttackTimer,
      conqueredRegions: s.conqueredRegions,
      selectedNode: s.selectedNode,
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
        saveTimer: 0,
        // Ensure new fields have defaults if loading old saves
        counterAttackTimer: data.counterAttackTimer ?? 60,
        conqueredRegions: data.conqueredRegions ?? [],
        selectedNode: data.selectedNode ?? null,
      });
    } catch { /* ignore corrupt saves */ }
  },
}));
