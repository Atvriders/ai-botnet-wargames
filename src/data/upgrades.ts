import { BotnetUpgrade } from '../types';

export const INITIAL_UPGRADES: Record<string, BotnetUpgrade> = {
  // Tier 1 — Script kiddie
  basicPayload: { id: 'basicPayload', name: 'Basic Payload', description: '+2x attack power', cost: 50, effect: 'attackPower', effectValue: 2, purchased: false, tier: 1, icon: '💣' },
  wormModule: { id: 'wormModule', name: 'Worm Module', description: '+2x spread speed', cost: 80, effect: 'spreadSpeed', effectValue: 2, purchased: false, tier: 1, icon: '🐛' },
  proxyChain: { id: 'proxyChain', name: 'Proxy Chain', description: '+2x stealth', cost: 60, effect: 'stealth', effectValue: 2, purchased: false, tier: 1, icon: '🔗' },
  botRecruiter: { id: 'botRecruiter', name: 'Bot Recruiter', description: '+500 max bots', cost: 100, effect: 'botCount', effectValue: 500, purchased: false, tier: 1, icon: '🤖' },

  // Tier 2 — Hacker
  polymorphic: { id: 'polymorphic', name: 'Polymorphic Code', description: '+3x attack power', cost: 500, effect: 'attackPower', effectValue: 3, purchased: false, requires: 'basicPayload', tier: 2, icon: '🧬' },
  zeroDay: { id: 'zeroDay', name: 'Zero-Day Exploit', description: '+3x spread speed', cost: 800, effect: 'spreadSpeed', effectValue: 3, purchased: false, requires: 'wormModule', tier: 2, icon: '🔓' },
  darkWeb: { id: 'darkWeb', name: 'Dark Web Tunnels', description: '+3x stealth', cost: 600, effect: 'stealth', effectValue: 3, purchased: false, requires: 'proxyChain', tier: 2, icon: '🕳️' },
  botnetArmy: { id: 'botnetArmy', name: 'Botnet Army', description: '+2000 max bots', cost: 1000, effect: 'botCount', effectValue: 2000, purchased: false, requires: 'botRecruiter', tier: 2, icon: '⚔️' },
  bandwidthTheft: { id: 'bandwidthTheft', name: 'Bandwidth Theft', description: '+50 Gbps attack bandwidth', cost: 700, effect: 'bandwidth', effectValue: 50, purchased: false, tier: 2, icon: '📡' },

  // Tier 3 — APT Operator
  aiMutation: { id: 'aiMutation', name: 'AI Mutation Engine', description: '+5x attack power', cost: 5000, effect: 'attackPower', effectValue: 5, purchased: false, requires: 'polymorphic', tier: 3, icon: '🧠' },
  superworm: { id: 'superworm', name: 'Superworm', description: '+5x spread speed', cost: 8000, effect: 'spreadSpeed', effectValue: 5, purchased: false, requires: 'zeroDay', tier: 3, icon: '🪱' },
  ghostProtocol: { id: 'ghostProtocol', name: 'Ghost Protocol', description: '+5x stealth', cost: 6000, effect: 'stealth', effectValue: 5, purchased: false, requires: 'darkWeb', tier: 3, icon: '👻' },
  zombieHorde: { id: 'zombieHorde', name: 'Zombie Horde', description: '+10000 max bots', cost: 10000, effect: 'botCount', effectValue: 10000, purchased: false, requires: 'botnetArmy', tier: 3, icon: '🧟' },
  fiberTap: { id: 'fiberTap', name: 'Fiber Tap', description: '+200 Gbps bandwidth', cost: 7000, effect: 'bandwidth', effectValue: 200, purchased: false, requires: 'bandwidthTheft', tier: 3, icon: '🔌' },

  // Tier 4 — Nation State
  quantumCracker: { id: 'quantumCracker', name: 'Quantum Cracker', description: '+10x attack power', cost: 50000, effect: 'attackPower', effectValue: 10, purchased: false, requires: 'aiMutation', tier: 4, icon: '⚛️' },
  selfReplicating: { id: 'selfReplicating', name: 'Self-Replicating AI', description: '+10x spread speed', cost: 80000, effect: 'spreadSpeed', effectValue: 10, purchased: false, requires: 'superworm', tier: 4, icon: '🔄' },
  deepfakeDecoy: { id: 'deepfakeDecoy', name: 'Deepfake Decoys', description: '+10x stealth', cost: 60000, effect: 'stealth', effectValue: 10, purchased: false, requires: 'ghostProtocol', tier: 4, icon: '🎭' },
  persistence: { id: 'persistence', name: 'Persistence Module', description: 'Infected nodes never recover', cost: 75000, effect: 'persistence', effectValue: 1, purchased: false, tier: 4, icon: '🔒' },

  // Tier 5 — Cyber Weapon
  stuxnet2: { id: 'stuxnet2', name: 'Stuxnet 2.0', description: '+50x attack power', cost: 500000, effect: 'attackPower', effectValue: 50, purchased: false, requires: 'quantumCracker', tier: 5, icon: '☢️' },
  skynet: { id: 'skynet', name: 'Skynet Protocol', description: '+50x spread speed', cost: 800000, effect: 'spreadSpeed', effectValue: 50, purchased: false, requires: 'selfReplicating', tier: 5, icon: '🛰️' },
  megaBotnet: { id: 'megaBotnet', name: 'Mega Botnet', description: '+100000 max bots', cost: 600000, effect: 'botCount', effectValue: 100000, purchased: false, requires: 'zombieHorde', tier: 5, icon: '🌊' },
  terabitFlood: { id: 'terabitFlood', name: 'Terabit Flood', description: '+2000 Gbps bandwidth', cost: 700000, effect: 'bandwidth', effectValue: 2000, purchased: false, requires: 'fiberTap', tier: 5, icon: '🌪️' },

  // Tier 6 — Digital God
  singularity: { id: 'singularity', name: 'The Singularity', description: '+500x attack power — total control', cost: 5000000, effect: 'attackPower', effectValue: 500, purchased: false, requires: 'stuxnet2', tier: 6, icon: '🌀' },
  omniscience: { id: 'omniscience', name: 'Omniscience', description: '+500x spread — infect everything instantly', cost: 8000000, effect: 'spreadSpeed', effectValue: 500, purchased: false, requires: 'skynet', tier: 6, icon: '👁️' },
  evolution: { id: 'evolution', name: 'Full Evolution', description: 'Evolve past all defenses', cost: 3000000, effect: 'evolution', effectValue: 100, purchased: false, tier: 6, icon: '🧬' },
};
