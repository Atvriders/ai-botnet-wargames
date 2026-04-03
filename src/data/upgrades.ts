import { BotnetUpgrade } from '../types';

export const INITIAL_UPGRADES: Record<string, BotnetUpgrade> = {
  // Tier 1 — Script kiddie (5-15 min to buy all, costs 50-200 BP)
  basicPayload: { id: 'basicPayload', name: 'Basic Payload', description: '+1.5x attack power', cost: 75, effect: 'attackPower', effectValue: 1.5, purchased: false, tier: 1, icon: '💣' },
  wormModule: { id: 'wormModule', name: 'Worm Module', description: '+1.5x spread speed', cost: 120, effect: 'spreadSpeed', effectValue: 1.5, purchased: false, tier: 1, icon: '🐛' },
  proxyChain: { id: 'proxyChain', name: 'Proxy Chain', description: '+1.5x stealth', cost: 90, effect: 'stealth', effectValue: 1.5, purchased: false, tier: 1, icon: '🔗' },
  botRecruiter: { id: 'botRecruiter', name: 'Bot Recruiter', description: '+200 max bots', cost: 200, effect: 'botCount', effectValue: 200, purchased: false, tier: 1, icon: '🤖' },

  // Tier 2 — Hacker (1-2 hours, costs 2K-10K BP)
  polymorphic: { id: 'polymorphic', name: 'Polymorphic Code', description: '+2x attack power', cost: 3000, effect: 'attackPower', effectValue: 2, purchased: false, requires: 'basicPayload', tier: 2, icon: '🧬' },
  zeroDay: { id: 'zeroDay', name: 'Zero-Day Exploit', description: '+2.5x spread speed', cost: 5000, effect: 'spreadSpeed', effectValue: 2.5, purchased: false, requires: 'wormModule', tier: 2, icon: '🔓' },
  darkWeb: { id: 'darkWeb', name: 'Dark Web Tunnels', description: '+2x stealth', cost: 4000, effect: 'stealth', effectValue: 2, purchased: false, requires: 'proxyChain', tier: 2, icon: '🕳️' },
  botnetArmy: { id: 'botnetArmy', name: 'Botnet Army', description: '+500 max bots', cost: 8000, effect: 'botCount', effectValue: 500, purchased: false, requires: 'botRecruiter', tier: 2, icon: '⚔️' },
  bandwidthTheft: { id: 'bandwidthTheft', name: 'Bandwidth Theft', description: '+20 Gbps attack bandwidth', cost: 6000, effect: 'bandwidth', effectValue: 20, purchased: false, tier: 2, icon: '📡' },
  autoTarget: { id: 'autoTarget', name: 'Auto-Targeting Module', description: 'Unlocks automatic target selection', cost: 5000, effect: 'evolution', effectValue: 1, purchased: false, tier: 2, icon: '🎯' },

  // Tier 3 — APT Operator (4-8 hours, costs 50K-500K BP)
  aiMutation: { id: 'aiMutation', name: 'AI Mutation Engine', description: '+3x attack power', cost: 100000, effect: 'attackPower', effectValue: 3, purchased: false, requires: 'polymorphic', tier: 3, icon: '🧠' },
  superworm: { id: 'superworm', name: 'Superworm', description: '+4x spread speed', cost: 250000, effect: 'spreadSpeed', effectValue: 4, purchased: false, requires: 'zeroDay', tier: 3, icon: '🪱' },
  ghostProtocol: { id: 'ghostProtocol', name: 'Ghost Protocol', description: '+3x stealth', cost: 150000, effect: 'stealth', effectValue: 3, purchased: false, requires: 'darkWeb', tier: 3, icon: '👻' },
  zombieHorde: { id: 'zombieHorde', name: 'Zombie Horde', description: '+2000 max bots', cost: 350000, effect: 'botCount', effectValue: 2000, purchased: false, requires: 'botnetArmy', tier: 3, icon: '🧟' },
  fiberTap: { id: 'fiberTap', name: 'Fiber Tap', description: '+80 Gbps bandwidth', cost: 200000, effect: 'bandwidth', effectValue: 80, purchased: false, requires: 'bandwidthTheft', tier: 3, icon: '🔌' },

  // Tier 4 — Nation State (1-2 days, costs 5M-50M BP)
  quantumCracker: { id: 'quantumCracker', name: 'Quantum Cracker', description: '+5x attack power', cost: 8000000, effect: 'attackPower', effectValue: 5, purchased: false, requires: 'aiMutation', tier: 4, icon: '⚛️' },
  selfReplicating: { id: 'selfReplicating', name: 'Self-Replicating AI', description: '+8x spread speed', cost: 20000000, effect: 'spreadSpeed', effectValue: 8, purchased: false, requires: 'superworm', tier: 4, icon: '🔄' },
  deepfakeDecoy: { id: 'deepfakeDecoy', name: 'Deepfake Decoys', description: '+6x stealth', cost: 12000000, effect: 'stealth', effectValue: 6, purchased: false, requires: 'ghostProtocol', tier: 4, icon: '🎭' },
  persistence: { id: 'persistence', name: 'Persistence Module', description: 'Infected nodes never recover', cost: 40000000, effect: 'persistence', effectValue: 1, purchased: false, tier: 4, icon: '🔒' },

  // Tier 5 — Cyber Weapon (2-3 days, costs 500M-5B BP)
  stuxnet2: { id: 'stuxnet2', name: 'Stuxnet 2.0', description: '+12x attack power', cost: 800000000, effect: 'attackPower', effectValue: 12, purchased: false, requires: 'quantumCracker', tier: 5, icon: '☢️' },
  skynet: { id: 'skynet', name: 'Skynet Protocol', description: '+15x spread speed', cost: 2000000000, effect: 'spreadSpeed', effectValue: 15, purchased: false, requires: 'selfReplicating', tier: 5, icon: '🛰️' },
  megaBotnet: { id: 'megaBotnet', name: 'Mega Botnet', description: '+10000 max bots', cost: 1200000000, effect: 'botCount', effectValue: 10000, purchased: false, requires: 'zombieHorde', tier: 5, icon: '🌊' },
  terabitFlood: { id: 'terabitFlood', name: 'Terabit Flood', description: '+500 Gbps bandwidth', cost: 1500000000, effect: 'bandwidth', effectValue: 500, purchased: false, requires: 'fiberTap', tier: 5, icon: '🌪️' },

  // Tier 6 — Digital God (3-4 days, costs 50B-500B BP)
  singularity: { id: 'singularity', name: 'The Singularity', description: '+25x attack power — total control', cost: 80000000000, effect: 'attackPower', effectValue: 25, purchased: false, requires: 'stuxnet2', tier: 6, icon: '🌀' },
  omniscience: { id: 'omniscience', name: 'Omniscience', description: '+30x spread — overwhelm all defenses', cost: 200000000000, effect: 'spreadSpeed', effectValue: 30, purchased: false, requires: 'skynet', tier: 6, icon: '👁️' },
  evolution: { id: 'evolution', name: 'Full Evolution', description: 'Evolve past all defenses', cost: 120000000000, effect: 'evolution', effectValue: 20, purchased: false, tier: 6, icon: '🧬' },

  // Tier 7 — Digital Apocalypse (5-6 days, costs 5T-50T BP)
  neuralHijack: { id: 'neuralHijack', name: 'Neural Hijack', description: '+60x attack power', cost: 8000000000000, effect: 'attackPower', effectValue: 60, purchased: false, requires: 'singularity', tier: 7, icon: '🧠' },
  temporalLoop: { id: 'temporalLoop', name: 'Temporal Loop', description: '+50x attack speed', cost: 5000000000000, effect: 'attackPower', effectValue: 50, purchased: false, requires: 'stuxnet2', tier: 7, icon: '⏳' },
  hiveMind: { id: 'hiveMind', name: 'Hive Mind', description: '+50000 max bots', cost: 15000000000000, effect: 'botCount', effectValue: 50000, purchased: false, requires: 'megaBotnet', tier: 7, icon: '🐝' },
  darkMatterTap: { id: 'darkMatterTap', name: 'Dark Matter Tap', description: '+2000 Gbps bandwidth', cost: 12000000000000, effect: 'bandwidth', effectValue: 2000, purchased: false, requires: 'terabitFlood', tier: 7, icon: '🌑' },
  phantomNet: { id: 'phantomNet', name: 'Phantom Network', description: '+75x stealth', cost: 10000000000000, effect: 'stealth', effectValue: 75, purchased: false, requires: 'deepfakeDecoy', tier: 7, icon: '👤' },

  // Tier 8 — Beyond (6-7 days, costs 500T-5Q BP)
  realityOverride: { id: 'realityOverride', name: 'Reality Override', description: '+150x attack — rewrite the simulation', cost: 800000000000000, effect: 'attackPower', effectValue: 150, purchased: false, requires: 'neuralHijack', tier: 8, icon: '🌀' },
  quantumEntangle: { id: 'quantumEntangle', name: 'Quantum Entanglement', description: '+200x spread — instant infection', cost: 1500000000000000, effect: 'spreadSpeed', effectValue: 200, purchased: false, requires: 'omniscience', tier: 8, icon: '⚡' },
  eschaton: { id: 'eschaton', name: 'The Eschaton', description: '+200000 max bots — the final swarm', cost: 3000000000000000, effect: 'botCount', effectValue: 200000, purchased: false, requires: 'hiveMind', tier: 8, icon: '🔥' },
  godMode: { id: 'godMode', name: 'God Mode', description: '+10000 Gbps — unlimited bandwidth', cost: 5000000000000000, effect: 'bandwidth', effectValue: 10000, purchased: false, requires: 'darkMatterTap', tier: 8, icon: '♾️' },
};
