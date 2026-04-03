# AI BOTNET WARGAMES

A real-time strategy game where you ARE the AI botnet. Evolve, spread, and take down the internet one node at a time.

> **This is a simulation / game. No real networks are harmed. No actual hacking takes place. Everything runs client-side in the browser with zero external network traffic.**

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

## Gameplay

You control an evolving AI botnet. Your goal: take down the entire internet by infecting nodes, building attack power, and launching DDoS waves across a simulated network topology.

### How to Play

1. **Start by infecting edge servers** — IoT clusters, blog farms, and unpatched servers are easy first targets
2. **Spread infection** — infected nodes automatically spread to connected nodes over time
3. **Launch attacks** — once a node is 50%+ infected, launch a DDoS attack to take it down
4. **Earn BotPower** — each node you take down earns BotPower based on its value
5. **Buy upgrades** — evolve your botnet with more powerful payloads, worms, and stealth
6. **Unlock attack vectors** — progress from SYN Floods to Ransomware to Cyber Nukes
7. **Enable auto-targeting** — let the AI pick the weakest adjacent target automatically
8. **Win** — reduce Internet Health to 0% by taking down all critical infrastructure

### The Network

40 nodes representing real internet infrastructure:

| Tier | Targets | Difficulty |
|------|---------|------------|
| Edge Servers | WordPress farms, IoT clusters, game servers, hospitals | Easy |
| ISPs | Comcast, AT&T, BT Group, Deutsche Telekom, NTT, Telia | Medium |
| CDNs & DNS | Cloudflare, AWS CloudFront, Akamai, Google DNS (8.8.8.8) | Hard |
| Internet Exchanges | LINX (London), DE-CIX (Frankfurt), JPIX (Tokyo) | Hard |
| Backbone Links | US East/Central, Transatlantic Cable, Transpacific Cable, EU Core | Very Hard |
| Special | Root DNS Servers, Starlink Constellation | Boss-level |

### Botnet Upgrades (6 Tiers)

| Tier | Name | Examples |
|------|------|---------|
| 1 | Script Kiddie | Basic Payload, Worm Module, Proxy Chain |
| 2 | Hacker | Polymorphic Code, Zero-Day Exploit, Dark Web Tunnels |
| 3 | APT Operator | AI Mutation Engine, Superworm, Ghost Protocol |
| 4 | Nation State | Quantum Cracker, Self-Replicating AI, Deepfake Decoys |
| 5 | Cyber Weapon | Stuxnet 2.0, Skynet Protocol, Terabit Flood |
| 6 | Digital God | The Singularity, Omniscience, Full Evolution |

### Attack Vectors (10 Types)

| Attack | Type | Damage | Cooldown |
|--------|------|--------|----------|
| SYN Flood | DDoS | 5 | 3s |
| HTTP Flood | DDoS | 15 | 4s |
| Slowloris | DDoS | 25 | 5s |
| DNS Amplification | DDoS | 50 | 6s |
| Buffer Overflow | Exploit | 40 | 8s |
| SQL Injection | Exploit | 60 | 10s |
| Network Worm | Worm | 80 | 12s |
| Ransomware | Ransomware | 120 | 15s |
| APT Campaign | APT | 200 | 20s |
| Cyber Nuke | DDoS | 1000 | 30s |

## Visual Design

Military C2 terminal aesthetic — black background with phosphor-green scan lines, pulsing network nodes, red infection tendrils spreading across connections, explosion animations when nodes go down.

- **Green** = online / healthy nodes
- **Yellow (pulsing)** = infected nodes
- **Red (flickering)** = nodes under active attack
- **Dark gray** = destroyed nodes
- **Red tendrils** = infection spreading along connections

## Tech Stack

- React 18 + TypeScript (strict)
- Vite 5
- Zustand (state management)
- HTML5 Canvas (network map rendering)
- No external dependencies beyond React

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3040

## Docker

```bash
docker compose up -d
```

Open http://localhost:3040

The Docker image is automatically built and pushed to `ghcr.io/atvriders/ai-botnet-wargames:latest` on every push to `master`.

## Disclaimer

This is a fictional game for entertainment purposes only. It simulates a network topology and botnet mechanics in a completely self-contained browser environment. No real networks, servers, or infrastructure are contacted, attacked, or affected in any way. All data is local. Zero external network traffic.
