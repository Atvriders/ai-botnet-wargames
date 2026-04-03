export type NodeStatus = 'online' | 'infected' | 'attacking' | 'down' | 'hardened';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'server' | 'isp' | 'datacenter' | 'backbone' | 'cdn' | 'dns' | 'exchange' | 'satellite';
  x: number; // 0-100 percentage position on map
  y: number;
  lat: number;
  lng: number;
  health: number; // 0-100
  maxHealth: number;
  defense: number; // damage reduction
  bandwidth: number; // Gbps
  importance: number; // 1-10 score, affects internet health
  status: NodeStatus;
  infectionLevel: number; // 0-100
  region: string;
  connections: string[]; // IDs of connected nodes
  value: number; // BotPower earned when taken down
  description: string;
}

export interface BotnetUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: 'attackPower' | 'spreadSpeed' | 'stealth' | 'bandwidth' | 'evolution' | 'botCount' | 'persistence';
  effectValue: number;
  purchased: boolean;
  requires?: string;
  tier: number;
  icon: string;
}

export interface AttackVector {
  id: string;
  name: string;
  description: string;
  baseDamage: number;
  cooldown: number; // seconds
  cost: number; // BotPower to unlock
  unlocked: boolean;
  icon: string;
  type: 'ddos' | 'exploit' | 'worm' | 'ransomware' | 'apt';
}

export interface GameState {
  // Resources
  botPower: number;
  totalBotPower: number;
  botsActive: number;
  maxBots: number;
  bandwidth: number; // total attack bandwidth Gbps

  // Multipliers
  attackMultiplier: number;
  spreadMultiplier: number;
  stealthLevel: number;
  evolutionLevel: number;

  // Network state
  nodes: Record<string, NetworkNode>;
  activeAttack: string | null; // node ID being attacked
  attackProgress: number; // 0-100
  attackCooldown: number;

  // Progression
  nodesInfected: number;
  nodesDown: number;
  totalNodes: number;
  internetHealth: number; // 0-100
  waveNumber: number;

  // Upgrades & attacks
  upgrades: Record<string, BotnetUpgrade>;
  attackVectors: Record<string, AttackVector>;
  selectedAttack: string;

  // Counter-attack
  counterAttackTimer: number;
  conqueredRegions: string[];

  // Selection
  selectedNode: string | null;
  highlightFilter: 'none' | 'infected' | 'down';

  // Meta
  gameStarted: boolean;
  gameWon: boolean;
  message: string;
  messageTimer: number;
  autoTargeting: boolean;
  saveTimer: number;

  // Actions
  tick: (dt: number) => void;
  infectNode: (id: string) => void;
  attackNode: (id: string) => void;
  buyUpgrade: (id: string) => void;
  unlockAttack: (id: string) => void;
  selectAttack: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleAutoTarget: () => void;
  setMessage: (msg: string) => void;
  setHighlightFilter: (filter: 'none' | 'infected' | 'down') => void;
  save: () => void;
  load: () => void;
}
