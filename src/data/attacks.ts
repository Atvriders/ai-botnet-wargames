import { AttackVector } from '../types';

export const INITIAL_ATTACKS: Record<string, AttackVector> = {
  synFlood: { id: 'synFlood', name: 'SYN Flood', description: 'Basic TCP flood attack', baseDamage: 5, cooldown: 3, cost: 0, unlocked: true, icon: '🌊', type: 'ddos' },
  httpFlood: { id: 'httpFlood', name: 'HTTP Flood', description: 'Layer 7 request flood', baseDamage: 15, cooldown: 4, cost: 200, unlocked: false, icon: '📨', type: 'ddos' },
  slowloris: { id: 'slowloris', name: 'Slowloris', description: 'Slow HTTP — exhausts connections', baseDamage: 25, cooldown: 5, cost: 500, unlocked: false, icon: '🦥', type: 'ddos' },
  dnsAmplify: { id: 'dnsAmplify', name: 'DNS Amplification', description: 'Reflected DDoS via open resolvers', baseDamage: 50, cooldown: 6, cost: 1500, unlocked: false, icon: '📡', type: 'ddos' },
  bufferOverflow: { id: 'bufferOverflow', name: 'Buffer Overflow', description: 'Memory corruption exploit', baseDamage: 40, cooldown: 8, cost: 2000, unlocked: false, icon: '💥', type: 'exploit' },
  sqlInjection: { id: 'sqlInjection', name: 'SQL Injection', description: 'Database takeover', baseDamage: 60, cooldown: 10, cost: 5000, unlocked: false, icon: '💉', type: 'exploit' },
  networkWorm: { id: 'networkWorm', name: 'Network Worm', description: 'Self-propagating malware', baseDamage: 80, cooldown: 12, cost: 10000, unlocked: false, icon: '🐛', type: 'worm' },
  ransomware: { id: 'ransomware', name: 'Ransomware', description: 'Encrypt and extort', baseDamage: 120, cooldown: 15, cost: 25000, unlocked: false, icon: '🔐', type: 'ransomware' },
  apt: { id: 'apt', name: 'APT Campaign', description: 'Advanced persistent threat — slow but devastating', baseDamage: 200, cooldown: 20, cost: 50000, unlocked: false, icon: '🎯', type: 'apt' },
  cyberNuke: { id: 'cyberNuke', name: 'Cyber Nuke', description: 'Destroy everything in the blast radius', baseDamage: 1000, cooldown: 30, cost: 200000, unlocked: false, icon: '☢️', type: 'ddos' },
};
