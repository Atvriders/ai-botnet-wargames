import { useRef, useEffect, useCallback, useState, CSSProperties } from 'react';
import { useGameStore } from '../store/useGameStore';
import { NetworkNode } from '../types';

const NODE_SIZES: Record<string, number> = {
  server: 8,
  isp: 14,
  datacenter: 16,
  backbone: 20,
  cdn: 15,
  dns: 22,
  exchange: 18,
  satellite: 13,
};

const STATUS_COLORS: Record<string, string> = {
  online: '#00FF41',
  infected: '#FFB300',
  attacking: '#FF0040',
  down: '#333333',
  hardened: '#00D4FF',
};

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  startTime: number;
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

const containerStyle: CSSProperties = {
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  background: '#050a0e',
  cursor: 'crosshair',
};

const tooltipStyle: CSSProperties = {
  position: 'absolute',
  background: 'rgba(0,0,0,0.9)',
  border: '1px solid rgba(0,255,65,0.3)',
  padding: '4px 8px',
  fontFamily: 'var(--font-terminal)',
  fontSize: 11,
  color: '#00FF41',
  pointerEvents: 'none',
  zIndex: 20,
  whiteSpace: 'nowrap',
  textShadow: '0 0 5px rgba(0,255,65,0.3)',
};

interface NetworkMapProps {
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  onInfectNode: (id: string) => void;
  onAttackNode: (id: string) => void;
}

export function NetworkMap({ selectedNode, onSelectNode, onInfectNode, onAttackNode }: NetworkMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const explosionsRef = useRef<Explosion[]>([]);
  const prevDownRef = useRef<Set<string>>(new Set());
  const timeRef = useRef(0);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const nodes = useGameStore(s => s.nodes);

  const getNodeAt = useCallback((mx: number, my: number, canvas: HTMLCanvasElement): NetworkNode | null => {
    const rect = canvas.getBoundingClientRect();
    const x = ((mx - rect.left) / rect.width) * 100;
    const y = ((my - rect.top) / rect.height) * 100;
    const nodeList = Object.values(nodes);

    for (let i = nodeList.length - 1; i >= 0; i--) {
      const n = nodeList[i];
      const r = NODE_SIZES[n.type] || 10;
      const dx = n.x - x;
      const dy = n.y - y;
      const pixR = (r / 100) * canvas.width;
      const pixDx = (dx / 100) * canvas.width;
      const pixDy = (dy / 100) * canvas.height;
      if (pixDx * pixDx + pixDy * pixDy < pixR * pixR * 4) return n;
    }
    return null;
  }, [nodes]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const node = getNodeAt(e.clientX, e.clientY, canvas);
    onSelectNode(node?.id || null);
  }, [getNodeAt, onSelectNode]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const node = getNodeAt(e.clientX, e.clientY, canvas);
    if (!node) return;

    if (node.status === 'online' && node.infectionLevel === 0) {
      onInfectNode(node.id);
    } else if (node.infectionLevel >= 50 && node.status !== 'down') {
      onAttackNode(node.id);
    }
  }, [getNodeAt, onInfectNode, onAttackNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const node = getNodeAt(e.clientX, e.clientY, canvas);
    if (node) {
      const rect = canvas.getBoundingClientRect();
      setTooltip({
        text: `${node.name} [${node.status.toUpperCase()}] HP:${node.health}/${node.maxHealth}`,
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 8,
      });
    } else {
      setTooltip(null);
    }
  }, [getNodeAt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    let running = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!running) return;
      const now = performance.now();
      timeRef.current = now;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const nodeArr = Object.values(useGameStore.getState().nodes);
      const nodeMap = useGameStore.getState().nodes;
      const selNode = useGameStore.getState().activeAttack;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(0,255,65,0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw connections
      for (const node of nodeArr) {
        const nx = (node.x / 100) * w;
        const ny = (node.y / 100) * h;

        for (const connId of node.connections) {
          const conn = nodeMap[connId];
          if (!conn) continue;
          // Only draw each connection once
          if (connId < node.id) continue;
          const cx = (conn.x / 100) * w;
          const cy = (conn.y / 100) * h;

          const bothInfected = (node.infectionLevel > 0 || node.status === 'down') &&
                               (conn.infectionLevel > 0 || conn.status === 'down');
          const anyDown = node.status === 'down' || conn.status === 'down';

          if (anyDown && !bothInfected) {
            ctx.strokeStyle = 'rgba(80,80,80,0.2)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          } else if (bothInfected) {
            ctx.strokeStyle = `rgba(255,0,64,${0.2 + Math.sin(now * 0.003) * 0.1})`;
            ctx.lineWidth = 1.5;
            // Animated dashed lines (red tendrils)
            const dashOffset = (now * 0.05) % 20;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -dashOffset;
          } else if (node.infectionLevel > 0 || conn.infectionLevel > 0) {
            ctx.strokeStyle = 'rgba(255,179,0,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = -(now * 0.03 % 12);
          } else {
            ctx.strokeStyle = 'rgba(0,255,65,0.08)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          }

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
      }

      // Draw nodes
      for (const node of nodeArr) {
        const nx = (node.x / 100) * w;
        const ny = (node.y / 100) * h;
        const r = NODE_SIZES[node.type] || 10;
        const isSelected = selectedNode === node.id || selNode === node.id;

        // Outer glow
        if (node.status !== 'down') {
          const glowColor = node.status === 'infected' ? 'rgba(255,179,0,VAL)' :
                            node.status === 'attacking' ? 'rgba(255,0,64,VAL)' :
                            node.infectionLevel > 0 ? 'rgba(255,179,0,VAL)' :
                            'rgba(0,255,65,VAL)';
          const pulseFactor = 0.15 + Math.sin(now * 0.004 + node.x) * 0.08;
          const grad = ctx.createRadialGradient(nx, ny, r * 0.5, nx, ny, r * 3);
          grad.addColorStop(0, glowColor.replace('VAL', String(pulseFactor)));
          grad.addColorStop(1, glowColor.replace('VAL', '0'));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(nx, ny, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node body (background)
        ctx.fillStyle = node.status === 'down' ? '#1a1a1a' : '#0a1010';
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();

        // Infection fill (red creeping up)
        if (node.infectionLevel > 0 && node.status !== 'down') {
          const infFill = node.infectionLevel / 100;
          ctx.save();
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.clip();
          const fillTop = ny + r - (infFill * r * 2);
          ctx.fillStyle = node.infectionLevel >= 100 ?
            `rgba(255,179,0,${0.4 + Math.sin(now * 0.005) * 0.15})` :
            `rgba(255,0,64,${0.3 + Math.sin(now * 0.006) * 0.1})`;
          ctx.fillRect(nx - r, fillTop, r * 2, ny + r - fillTop);
          ctx.restore();
        }

        // Node border
        const borderColor = isSelected ? '#ffffff' :
                           node.status === 'down' ? '#333333' :
                           STATUS_COLORS[node.status] || '#00FF41';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.stroke();

        // Selection ring
        if (isSelected) {
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -(now * 0.05 % 16);
          ctx.beginPath();
          ctx.arc(nx, ny, r + 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }

        // DNS glow effect
        if (node.type === 'dns' && node.status !== 'down') {
          const dnsGlow = ctx.createRadialGradient(nx, ny, r, nx, ny, r * 4);
          dnsGlow.addColorStop(0, `rgba(0,212,255,${0.1 + Math.sin(now * 0.002) * 0.05})`);
          dnsGlow.addColorStop(1, 'rgba(0,212,255,0)');
          ctx.fillStyle = dnsGlow;
          ctx.beginPath();
          ctx.arc(nx, ny, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node label
        if (r >= 12 || isSelected) {
          ctx.font = '9px "Share Tech Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = node.status === 'down' ? '#444' :
                         node.status === 'infected' ? '#FFB300' :
                         '#00FF41';
          ctx.globalAlpha = 0.8;
          ctx.fillText(node.name, nx, ny + r + 12);
          ctx.globalAlpha = 1;
        }

        // Flicker effect for attacking nodes
        if (node.status === 'attacking') {
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(255,0,64,${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(nx, ny, r * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw explosions
      const explosions = explosionsRef.current;
      for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        const elapsed = now - ex.startTime;
        const progress = elapsed / 800; // 800ms duration
        if (progress > 1) {
          explosions.splice(i, 1);
          continue;
        }
        ex.radius = ex.maxRadius * progress;
        ex.alpha = (1 - progress) * 0.6;

        // Outer ring
        ctx.strokeStyle = `rgba(255,0,64,${ex.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
        grad.addColorStop(0, `rgba(255,100,0,${ex.alpha * 0.3})`);
        grad.addColorStop(0.5, `rgba(255,0,64,${ex.alpha * 0.15})`);
        grad.addColorStop(1, 'rgba(255,0,64,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        ctx.fill();

        // Debris particles
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 + progress * 2;
          const dist = ex.radius * (0.5 + Math.random() * 0.5);
          const px = ex.x + Math.cos(angle) * dist;
          const py = ex.y + Math.sin(angle) * dist;
          ctx.fillStyle = `rgba(255,${Math.floor(100 + Math.random() * 155)},0,${ex.alpha})`;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }

      // Check for new node-downs to trigger explosions
      const currentDown = new Set<string>();
      for (const node of nodeArr) {
        if (node.status === 'down') currentDown.add(node.id);
      }
      for (const id of currentDown) {
        if (!prevDownRef.current.has(id)) {
          const node = nodeMap[id];
          const nx = (node.x / 100) * w;
          const ny = (node.y / 100) * h;
          explosions.push({
            x: nx, y: ny,
            radius: 0,
            maxRadius: NODE_SIZES[node.type] * 6,
            alpha: 1,
            startTime: now,
          });
        }
      }
      prevDownRef.current = currentDown;

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [selectedNode]);

  return (
    <div ref={containerRef} style={containerStyle}
         onClick={handleClick}
         onContextMenu={handleContextMenu}
         onMouseMove={handleMouseMove}
         onMouseLeave={() => setTooltip(null)}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {tooltip && (
        <div style={{
          ...tooltipStyle,
          left: tooltip.x,
          top: tooltip.y,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
