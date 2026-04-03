import { NetworkNode } from '../types';

export const initialNodes: NetworkNode[] = [
  // === TIER 1: Entry Points (easy targets) ===
  { id: 'home1', name: 'Home Router #1', type: 'server', x: 15, y: 20, health: 100, maxHealth: 100, defense: 2, bandwidth: 0.1, importance: 1, status: 'infected', infectionLevel: 100, region: 'Local', connections: ['isp1'], value: 5, description: 'Your starting point. A compromised home router.' },
  { id: 'srv1', name: 'Unpatched FTP Server', type: 'server', x: 22, y: 35, health: 100, maxHealth: 100, defense: 3, bandwidth: 0.5, importance: 1, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1'], value: 8, description: 'Running vsftpd 2.3.4 with known backdoor.' },
  { id: 'srv2', name: 'IoT Camera Hub', type: 'server', x: 10, y: 45, health: 80, maxHealth: 80, defense: 1, bandwidth: 0.2, importance: 1, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1'], value: 6, description: 'Default credentials. Thousands like it.' },
  { id: 'srv3', name: 'WordPress Blog Server', type: 'server', x: 25, y: 15, health: 100, maxHealth: 100, defense: 4, bandwidth: 1, importance: 1, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1', 'cdn1'], value: 10, description: 'Outdated plugins. Easy SQL injection.' },
  { id: 'srv4', name: 'University Mail Server', type: 'server', x: 8, y: 60, health: 120, maxHealth: 120, defense: 5, bandwidth: 2, importance: 2, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1', 'isp2'], value: 15, description: 'Academic network. Minimal security budget.' },
  { id: 'srv5', name: 'Small Business NAS', type: 'server', x: 18, y: 55, health: 90, maxHealth: 90, defense: 3, bandwidth: 0.5, importance: 1, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1'], value: 7, description: 'QNAP with QLocker vulnerability.' },

  // === TIER 2: ISPs ===
  { id: 'isp1', name: 'ComcastNet ISP', type: 'isp', x: 25, y: 40, health: 300, maxHealth: 300, defense: 8, bandwidth: 10, importance: 3, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['home1', 'srv1', 'srv2', 'srv3', 'srv4', 'srv5', 'isp2', 'dc1', 'bb1'], value: 50, description: 'Regional ISP. Gateway to the backbone.' },
  { id: 'isp2', name: 'AT&T Regional Hub', type: 'isp', x: 40, y: 25, health: 350, maxHealth: 350, defense: 10, bandwidth: 15, importance: 4, status: 'online', infectionLevel: 0, region: 'US-Central', connections: ['isp1', 'srv4', 'dc1', 'dc2', 'bb1', 'bb2', 'cdn1'], value: 60, description: 'Major US carrier. High bandwidth target.' },
  { id: 'isp3', name: 'Deutsche Telekom', type: 'isp', x: 65, y: 20, health: 400, maxHealth: 400, defense: 12, bandwidth: 20, importance: 4, status: 'online', infectionLevel: 0, region: 'EU', connections: ['bb2', 'dc3', 'exch1', 'srv8'], value: 65, description: 'European carrier. Connects EU infrastructure.' },
  { id: 'isp4', name: 'NTT Communications', type: 'isp', x: 85, y: 35, health: 380, maxHealth: 380, defense: 14, bandwidth: 25, importance: 4, status: 'online', infectionLevel: 0, region: 'Asia-Pacific', connections: ['bb3', 'dc4', 'sat1', 'srv9'], value: 70, description: 'Asia-Pacific backbone carrier.' },

  // === TIER 3: Data Centers ===
  { id: 'dc1', name: 'AWS us-east-1', type: 'datacenter', x: 35, y: 50, health: 500, maxHealth: 500, defense: 18, bandwidth: 50, importance: 6, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['isp1', 'isp2', 'bb1', 'cdn1', 'cdn2', 'dns1'], value: 120, description: 'Amazon Web Services. Hosts 30% of the internet.' },
  { id: 'dc2', name: 'Google Cloud Central', type: 'datacenter', x: 50, y: 35, health: 550, maxHealth: 550, defense: 20, bandwidth: 60, importance: 7, status: 'online', infectionLevel: 0, region: 'US-Central', connections: ['isp2', 'bb1', 'bb2', 'cdn2', 'dns2'], value: 140, description: 'Google infrastructure. Massive compute power.' },
  { id: 'dc3', name: 'Hetzner Frankfurt', type: 'datacenter', x: 62, y: 35, health: 400, maxHealth: 400, defense: 15, bandwidth: 40, importance: 5, status: 'online', infectionLevel: 0, region: 'EU', connections: ['isp3', 'bb2', 'exch1'], value: 100, description: 'Major European hosting provider.' },
  { id: 'dc4', name: 'Equinix Tokyo', type: 'datacenter', x: 82, y: 50, health: 450, maxHealth: 450, defense: 16, bandwidth: 45, importance: 5, status: 'online', infectionLevel: 0, region: 'Asia-Pacific', connections: ['isp4', 'bb3', 'exch2'], value: 110, description: 'Key Asian interconnection point.' },

  // === TIER 3: Servers in Data Centers ===
  { id: 'srv6', name: 'Netflix Streaming Node', type: 'server', x: 30, y: 60, health: 200, maxHealth: 200, defense: 12, bandwidth: 30, importance: 3, status: 'online', infectionLevel: 0, region: 'US-East', connections: ['dc1', 'cdn1'], value: 35, description: 'OpenConnect appliance. Serves video globally.' },
  { id: 'srv7', name: 'GitHub Code Repos', type: 'server', x: 45, y: 55, health: 250, maxHealth: 250, defense: 15, bandwidth: 20, importance: 4, status: 'online', infectionLevel: 0, region: 'US-Central', connections: ['dc2', 'cdn2'], value: 45, description: 'Developer infrastructure. Supply chain target.' },
  { id: 'srv8', name: 'EU Banking Gateway', type: 'server', x: 70, y: 28, health: 300, maxHealth: 300, defense: 25, bandwidth: 10, importance: 5, status: 'online', infectionLevel: 0, region: 'EU', connections: ['isp3', 'dc3'], value: 80, description: 'SWIFT-connected. Heavily fortified.' },
  { id: 'srv9', name: 'Sony PSN Servers', type: 'server', x: 88, y: 45, health: 200, maxHealth: 200, defense: 12, bandwidth: 25, importance: 3, status: 'online', infectionLevel: 0, region: 'Asia-Pacific', connections: ['isp4', 'dc4'], value: 40, description: 'PlayStation Network. Millions of users.' },

  // === TIER 4: CDNs ===
  { id: 'cdn1', name: 'Cloudflare Edge', type: 'cdn', x: 38, y: 15, health: 600, maxHealth: 600, defense: 22, bandwidth: 80, importance: 7, status: 'online', infectionLevel: 0, region: 'Global', connections: ['dc1', 'srv3', 'srv6', 'isp2', 'bb1', 'dns1'], value: 150, description: 'Protects millions of websites. DDoS shield.' },
  { id: 'cdn2', name: 'Akamai Network', type: 'cdn', x: 55, y: 60, health: 550, maxHealth: 550, defense: 20, bandwidth: 70, importance: 6, status: 'online', infectionLevel: 0, region: 'Global', connections: ['dc1', 'dc2', 'srv7', 'bb2'], value: 130, description: 'Largest CDN. Serves 30% of web traffic.' },

  // === TIER 5: Backbone ===
  { id: 'bb1', name: 'Level3/Lumen Backbone', type: 'backbone', x: 40, y: 70, health: 800, maxHealth: 800, defense: 25, bandwidth: 100, importance: 8, status: 'online', infectionLevel: 0, region: 'US', connections: ['isp1', 'isp2', 'dc1', 'dc2', 'cdn1', 'bb2', 'bb3'], value: 200, description: 'Tier-1 backbone. Carries intercontinental traffic.' },
  { id: 'bb2', name: 'Telia Carrier EU', type: 'backbone', x: 60, y: 70, health: 750, maxHealth: 750, defense: 24, bandwidth: 90, importance: 8, status: 'online', infectionLevel: 0, region: 'EU', connections: ['isp2', 'isp3', 'dc2', 'dc3', 'cdn2', 'bb1', 'bb3', 'exch1'], value: 190, description: 'European backbone. Transatlantic cables.' },
  { id: 'bb3', name: 'PCCW Pacific Backbone', type: 'backbone', x: 78, y: 70, health: 700, maxHealth: 700, defense: 22, bandwidth: 85, importance: 7, status: 'online', infectionLevel: 0, region: 'Asia-Pacific', connections: ['isp4', 'dc4', 'bb1', 'bb2', 'exch2', 'sat1'], value: 180, description: 'Trans-Pacific fiber. US-Asia link.' },

  // === TIER 5: Internet Exchanges ===
  { id: 'exch1', name: 'DE-CIX Frankfurt', type: 'exchange', x: 58, y: 45, health: 700, maxHealth: 700, defense: 28, bandwidth: 120, importance: 8, status: 'online', infectionLevel: 0, region: 'EU', connections: ['isp3', 'dc3', 'bb2', 'dns2'], value: 200, description: 'Largest internet exchange. 10+ Tbps peak.' },
  { id: 'exch2', name: 'JPNAP Tokyo', type: 'exchange', x: 90, y: 60, health: 650, maxHealth: 650, defense: 26, bandwidth: 100, importance: 7, status: 'online', infectionLevel: 0, region: 'Asia-Pacific', connections: ['dc4', 'bb3', 'isp4'], value: 180, description: 'Japan Network Access Point. Asia hub.' },

  // === TIER 5: Satellites ===
  { id: 'sat1', name: 'Starlink Constellation', type: 'satellite', x: 80, y: 10, health: 500, maxHealth: 500, defense: 30, bandwidth: 50, importance: 6, status: 'online', infectionLevel: 0, region: 'Global', connections: ['isp4', 'bb3'], value: 160, description: 'LEO satellite network. Hard to reach physically.' },

  // === TIER 6: DNS Root ===
  { id: 'dns1', name: 'Root DNS (A-M)', type: 'dns', x: 45, y: 80, health: 1000, maxHealth: 1000, defense: 35, bandwidth: 200, importance: 10, status: 'online', infectionLevel: 0, region: 'Global', connections: ['dc1', 'cdn1', 'bb1', 'dns2'], value: 500, description: 'Root DNS servers. The internet\'s address book.' },
  { id: 'dns2', name: 'DNS Root Mirrors', type: 'dns', x: 60, y: 85, health: 900, maxHealth: 900, defense: 32, bandwidth: 150, importance: 9, status: 'online', infectionLevel: 0, region: 'Global', connections: ['dc2', 'exch1', 'dns1'], value: 400, description: 'Anycast DNS mirrors. Redundant by design.' },
];
