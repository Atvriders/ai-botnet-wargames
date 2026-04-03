import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { NetworkNode } from '../types';
import {
  latLngToXYZ,
  rotateX,
  rotateY,
  project,
  isFrontFacing,
  generateWireframe,
  greatCircleArc,
  Vec3,
} from '../lib/globe';
import { CONTINENTS } from '../lib/continents';

// ── Sizing by node type ──────────────────────────────────────
const NODE_SIZES: Record<string, number> = {
  server: 6,
  isp: 7,
  datacenter: 8,
  backbone: 10,
  cdn: 9,
  dns: 11,
  exchange: 8,
  satellite: 6,
};

// ── Status colors ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  online: '#00FF41',
  infected: '#FFB300',
  attacking: '#FF0040',
  down: '#333333',
  hardened: '#00D4FF',
};

// ── Explosion effect ─────────────────────────────────────────
interface Explosion {
  sx: number; // screen x
  sy: number; // screen y
  radius: number;
  maxRadius: number;
  startTime: number;
}

// ── Tooltip ──────────────────────────────────────────────────
interface Tooltip {
  text: string;
  x: number;
  y: number;
}

// ── Projected node cache (per frame) ─────────────────────────
interface ProjectedNode {
  node: NetworkNode;
  sx: number;
  sy: number;
  z: number;
  front: boolean;
}

// ── Helper: parse hex color to [r,g,b] ──────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// ── The Component ────────────────────────────────────────────
export function GlobeMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // Rotation state
  const rotXRef = useRef(-0.3); // slight tilt so we see top
  const rotYRef = useRef(0);
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Zoom
  const zoomRef = useRef(1.0);

  // Explosions
  const explosionsRef = useRef<Explosion[]>([]);
  const prevDownRef = useRef<Set<string>>(new Set());

  // Projected nodes cache (for hit testing outside the render loop)
  const projectedRef = useRef<ProjectedNode[]>([]);

  // Selected node (local state so we can show highlight + pass to panels)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // Keep ref in sync so the render loop never needs to restart
  selectedNodeIdRef.current = selectedNodeId;

  // Highlight filter
  const highlightFilter = useGameStore((s) => s.highlightFilter);
  const highlightFilterRef = useRef(highlightFilter);
  highlightFilterRef.current = highlightFilter;

  // Store actions
  const infectNode = useGameStore((s) => s.infectNode);
  const attackNode = useGameStore((s) => s.attackNode);

  // ── Hit-test helper ────────────────────────────────────────
  const hitTest = useCallback(
    (clientX: number, clientY: number): ProjectedNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      let closest: ProjectedNode | null = null;
      let closestDist = 15; // max pick radius in CSS pixels

      for (const pn of projectedRef.current) {
        if (!pn.front) continue;
        const dx = pn.sx - mx;
        const dy = pn.sy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = pn;
        }
      }
      return closest;
    },
    [],
  );

  // ── Mouse / wheel handlers (attached via useEffect for non-passive wheel) ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // left only for drag
      draggingRef.current = true;
      velXRef.current = 0;
      velYRef.current = 0;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        rotYRef.current += dx * 0.005;
        rotXRef.current += dy * 0.005;
        // Clamp X rotation to avoid flipping
        rotXRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, rotXRef.current),
        );
        velXRef.current = dy * 0.005;
        velYRef.current = dx * 0.005;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }

      // Tooltip
      const pn = hitTestFromEvent(e);
      if (pn) {
        const rect = container.getBoundingClientRect();
        setTooltip({
          text: `${pn.node.name} [${pn.node.status.toUpperCase()}] HP:${pn.node.health}/${pn.node.maxHealth} INF:${pn.node.infectionLevel}%`,
          x: e.clientX - rect.left + 14,
          y: e.clientY - rect.top - 10,
        });
      } else {
        setTooltip(null);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      zoomRef.current = Math.max(0.5, Math.min(3.0, zoomRef.current + delta));
    };

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const pn = hitTestFromEvent(e);
      setSelectedNodeId(pn ? pn.node.id : null);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const pn = hitTestFromEvent(e);
      if (!pn) return;
      const n = pn.node;
      if (n.status === 'online' && n.infectionLevel === 0) {
        infectNode(n.id);
      } else if (n.infectionLevel >= 50 && n.status !== 'down') {
        attackNode(n.id);
      }
    };

    // Convenience closure that wraps hitTest with event coords
    const hitTestFromEvent = (e: MouseEvent) =>
      hitTest(e.clientX, e.clientY);

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);
    container.addEventListener('contextmenu', handleContextMenu);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [hitTest, infectNode, attackNode]);

  // ── Main render loop ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    let running = true;
    let cw = 0;
    let ch = 0;

    // ── Resize handling ──────────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cw = container.clientWidth;
      ch = container.clientHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Pre-generate wireframe (unit sphere, we scale at draw time)
    const wireframe = generateWireframe(1, 18, 24);

    // ── Per-frame draw ───────────────────────────────────────
    const draw = () => {
      if (!running) return;
      const now = performance.now();

      // ── Auto-rotate / inertia ──────────────────────────────
      if (!draggingRef.current) {
        // Inertia decay
        if (Math.abs(velYRef.current) > 0.0001 || Math.abs(velXRef.current) > 0.0001) {
          rotYRef.current += velYRef.current;
          rotXRef.current += velXRef.current;
          rotXRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotXRef.current));
          velXRef.current *= 0.95;
          velYRef.current *= 0.95;
        } else {
          // Auto-rotate
          rotYRef.current += 0.002;
        }
      }

      const rotationX = rotXRef.current;
      const rotationY = rotYRef.current;
      const zoom = zoomRef.current;

      // ── Derived constants ──────────────────────────────────
      const cx = cw / 2;
      const cy = ch / 2;
      const baseRadius = 0.4 * Math.min(cw, ch);
      const radius = baseRadius * zoom;
      const fov = radius * 3; // perspective "distance"

      // ── Clear ──────────────────────────────────────────────
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, ch);

      // ── Subtle atmosphere glow ─────────────────────────────
      const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.4);
      atmosGrad.addColorStop(0, 'rgba(0,255,65,0.03)');
      atmosGrad.addColorStop(0.6, 'rgba(0,255,65,0.012)');
      atmosGrad.addColorStop(1, 'rgba(0,255,65,0)');
      ctx.fillStyle = atmosGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // ── Helper: transform a 3D unit-sphere point to screen ─
      const transform = (p: Vec3): [number, number, number, boolean] => {
        let r: Vec3 = [p[0] * radius, p[1] * radius, p[2] * radius];
        r = rotateX(r, rotationX);
        r = rotateY(r, rotationY);
        const front = isFrontFacing(r);
        const [sx, sy] = project(r, fov, cx, cy);
        return [sx, sy, r[2], front];
      };

      // ── Draw wireframe (batched into one path) ──────────────
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.12)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      for (const line of wireframe) {
        let prevScreen: [number, number] | null = null;
        let prevFront = false;

        for (const pt of line) {
          const [sx, sy, , front] = transform(pt);
          if (prevScreen !== null && prevFront && front) {
            ctx.moveTo(prevScreen[0], prevScreen[1]);
            ctx.lineTo(sx, sy);
          }
          prevScreen = [sx, sy];
          prevFront = front;
        }
      }
      ctx.stroke();

      // ── Equator ring (bright green outline) ────────────────
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const eqSegments = 120;
      let eqPrev: [number, number] | null = null;
      let eqPrevFront = false;
      for (let i = 0; i <= eqSegments; i++) {
        const lng = (360 / eqSegments) * i;
        const ep: Vec3 = [
          Math.sin((lng * Math.PI) / 180),
          0,
          Math.cos((lng * Math.PI) / 180),
        ];
        const [esx, esy, , efront] = transform(ep);
        if (eqPrev !== null && eqPrevFront && efront) {
          ctx.moveTo(eqPrev[0], eqPrev[1]);
          ctx.lineTo(esx, esy);
        }
        eqPrev = [esx, esy];
        eqPrevFront = efront;
      }
      ctx.stroke();

      // ── Draw continent outlines ────────────────────────────
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
      ctx.lineWidth = 1.5;
      for (const polygon of CONTINENTS) {
        ctx.beginPath();
        let prevScreen: [number, number] | null = null;
        let prevFront = false;

        for (let i = 0; i < polygon.length; i++) {
          const [lat, lng] = polygon[i];
          const p3 = latLngToXYZ(lat, lng, 1);
          const [sx, sy, , front] = transform(p3);

          if (prevScreen !== null && prevFront && front) {
            ctx.moveTo(prevScreen[0], prevScreen[1]);
            ctx.lineTo(sx, sy);
          }
          prevScreen = [sx, sy];
          prevFront = front;
        }
        ctx.stroke();
      }

      // ── Get current game state ─────────────────────────────
      const state = useGameStore.getState();
      const nodeMap = state.nodes;
      const nodeArr = Object.values(nodeMap);
      const activeAttack = state.activeAttack;

      // ── Project all nodes ──────────────────────────────────
      const projected: ProjectedNode[] = [];
      for (const node of nodeArr) {
        const p3 = latLngToXYZ(node.lat, node.lng, 1);
        const [sx, sy, z, front] = transform(p3);
        projected.push({ node, sx, sy, z, front });
      }
      // Store for hit-testing
      projectedRef.current = projected;

      // Build lookup by id
      const projMap = new Map<string, ProjectedNode>();
      for (const pn of projected) projMap.set(pn.node.id, pn);

      // ── Draw connections ───────────────────────────────────
      ctx.lineWidth = 0.5;
      const drawnConns = new Set<string>();

      for (const pn of projected) {
        for (const connId of pn.node.connections) {
          const key = pn.node.id < connId ? `${pn.node.id}:${connId}` : `${connId}:${pn.node.id}`;
          if (drawnConns.has(key)) continue;
          drawnConns.add(key);

          const other = projMap.get(connId);
          if (!other) continue;

          // At least one endpoint must be front-facing
          if (!pn.front && !other.front) continue;

          const n1 = pn.node;
          const n2 = other.node;

          // Determine color
          const anyDown = n1.status === 'down' || n2.status === 'down';
          const anyInfected =
            n1.infectionLevel > 0 || n2.infectionLevel > 0;

          // Generate great-circle arc points
          const arcPts = greatCircleArc(
            n1.lat,
            n1.lng,
            n2.lat,
            n2.lng,
            1,
            24,
          );

          // Transform arc points
          const screenPts: { sx: number; sy: number; front: boolean }[] = [];
          for (const ap of arcPts) {
            const [sx, sy, , front] = transform(ap);
            screenPts.push({ sx, sy, front });
          }

          // Set style
          if (anyDown) {
            ctx.strokeStyle = 'rgba(80,80,80,0.15)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          } else if (anyInfected) {
            ctx.strokeStyle = `rgba(255,0,64,${0.2 + Math.sin(now * 0.003) * 0.1})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([4, 3]);
            ctx.lineDashOffset = -(now * 0.05) % 14;
          } else {
            ctx.strokeStyle = 'rgba(0,255,65,0.1)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          }

          // Draw segments where at least one endpoint is front-facing
          for (let i = 1; i < screenPts.length; i++) {
            const a = screenPts[i - 1];
            const b = screenPts[i];
            if (!a.front && !b.front) continue;

            const alpha = !a.front || !b.front ? 0.3 : 1;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
      }

      // ── Draw nodes (back-facing first, then front for proper layering) ──
      // Sort: back-facing first (lower z), front-facing on top
      const sortedNodes = [...projected].sort((a, b) => a.z - b.z);

      const curHighlightFilter = highlightFilterRef.current;

      for (const pn of sortedNodes) {
        const { node, sx, sy, front } = pn;
        const baseSize = (NODE_SIZES[node.type] || 5) * zoom;
        const isSelected = selectedNodeIdRef.current === node.id || activeAttack === node.id;

        // ── Highlight filter dimming ─────────────────────────
        const isHighlighted =
          curHighlightFilter === 'none' ||
          (curHighlightFilter === 'infected' && node.status === 'infected') ||
          (curHighlightFilter === 'down' && node.status === 'down');
        const filterAlpha = curHighlightFilter === 'none' ? 1 : (isHighlighted ? 1 : 0.2);
        const alpha = (front ? 1 : 0.15) * filterAlpha;

        ctx.globalAlpha = alpha;

        // ── Outer glow (front-facing, alive nodes) ───────────
        if (front && node.status !== 'down') {
          const [gr, gg, gb] = hexToRgb(STATUS_COLORS[node.status] || '#00FF41');
          const pulseFactor =
            node.status === 'infected'
              ? 0.2 + Math.sin(now * 0.005 + node.lat) * 0.12
              : 0.12 + Math.sin(now * 0.003 + node.lng) * 0.06;
          const glow = ctx.createRadialGradient(
            sx,
            sy,
            baseSize * 0.3,
            sx,
            sy,
            baseSize * 3.5,
          );
          glow.addColorStop(0, `rgba(${gr},${gg},${gb},${pulseFactor})`);
          glow.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sx, sy, baseSize * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // ── Node body fill ───────────────────────────────────
        ctx.fillStyle = node.status === 'down' ? '#111' : '#060d0d';
        ctx.beginPath();
        ctx.arc(sx, sy, baseSize, 0, Math.PI * 2);
        ctx.fill();

        // ── Infection level arc (red fill creeping around) ───
        if (node.infectionLevel > 0 && node.status !== 'down') {
          const infAngle = (node.infectionLevel / 100) * Math.PI * 2;
          const infColor =
            node.infectionLevel >= 100
              ? `rgba(255,179,0,${0.45 + Math.sin(now * 0.005) * 0.15})`
              : `rgba(255,0,64,${0.35 + Math.sin(now * 0.006) * 0.1})`;
          ctx.fillStyle = infColor;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.arc(sx, sy, baseSize, -Math.PI / 2, -Math.PI / 2 + infAngle);
          ctx.closePath();
          ctx.fill();
        }

        // ── Node border ring ─────────────────────────────────
        const color = STATUS_COLORS[node.status] || '#00FF41';

        // Flickering for attacking nodes
        if (node.status === 'attacking' && front) {
          const flicker = Math.random() > 0.4 ? 1 : 0.3;
          ctx.globalAlpha = alpha * flicker;
        }

        ctx.strokeStyle = isSelected ? '#00FFFF' : color;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, baseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Reset alpha for selected ring
        ctx.globalAlpha = alpha;

        // ── Selection ring ───────────────────────────────────
        if (isSelected && front) {
          ctx.strokeStyle = 'rgba(0,255,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -(now * 0.06) % 16;
          ctx.beginPath();
          ctx.arc(sx, sy, baseSize + 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;

          // Outer pulse
          const pulseR = baseSize + 8 + Math.sin(now * 0.004) * 3;
          ctx.strokeStyle = `rgba(0,255,255,${0.15 + Math.sin(now * 0.003) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // ── Highlight filter ring ────────────────────────────
        if (front && isHighlighted && curHighlightFilter !== 'none') {
          const ringColor = curHighlightFilter === 'infected' ? 'rgba(255,179,0,' : 'rgba(255,0,64,';
          const pulseAlpha = 0.5 + Math.sin(now * 0.006) * 0.3;
          ctx.strokeStyle = ringColor + pulseAlpha + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, baseSize + 6, 0, Math.PI * 2);
          ctx.stroke();

          // Outer pulsing ring
          const outerR = baseSize + 10 + Math.sin(now * 0.004) * 3;
          ctx.strokeStyle = ringColor + (pulseAlpha * 0.4) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, outerR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // ── Node label (front-facing, larger nodes or selected) ──
        if (front && (baseSize >= 7 || isSelected)) {
          ctx.font = '9px "Share Tech Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle =
            node.status === 'down'
              ? '#444'
              : node.status === 'infected'
                ? '#FFB300'
                : '#00FF41';
          ctx.globalAlpha = 0.75 * alpha;
          ctx.fillText(node.name, sx, sy + baseSize + 12);
        }

        ctx.globalAlpha = 1;
      }

      // ── Explosions ─────────────────────────────────────────
      const explosions = explosionsRef.current;
      for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        const elapsed = now - ex.startTime;
        const progress = elapsed / 1000; // 1 second
        if (progress > 1) {
          explosions.splice(i, 1);
          continue;
        }

        const curR = ex.maxRadius * progress;
        const curAlpha = (1 - progress) * 0.7;

        // Outer ring
        ctx.strokeStyle = `rgba(255,0,64,${curAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex.sx, ex.sy, curR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const grad = ctx.createRadialGradient(
          ex.sx,
          ex.sy,
          0,
          ex.sx,
          ex.sy,
          curR,
        );
        grad.addColorStop(0, `rgba(255,120,0,${curAlpha * 0.4})`);
        grad.addColorStop(0.5, `rgba(255,0,64,${curAlpha * 0.2})`);
        grad.addColorStop(1, 'rgba(255,0,64,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex.sx, ex.sy, curR, 0, Math.PI * 2);
        ctx.fill();

        // Debris particles
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2 + progress * 3;
          const dist = curR * (0.4 + Math.random() * 0.6);
          const px = ex.sx + Math.cos(angle) * dist;
          const py = ex.sy + Math.sin(angle) * dist;
          ctx.fillStyle = `rgba(255,${Math.floor(80 + Math.random() * 175)},0,${curAlpha})`;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }

      // ── Detect new node-downs for explosions ───────────────
      const currentDown = new Set<string>();
      for (const pn of projected) {
        if (pn.node.status === 'down') currentDown.add(pn.node.id);
      }
      for (const id of currentDown) {
        if (!prevDownRef.current.has(id)) {
          const pn = projMap.get(id);
          if (pn && pn.front) {
            explosions.push({
              sx: pn.sx,
              sy: pn.sy,
              radius: 0,
              maxRadius: (NODE_SIZES[pn.node.type] || 5) * zoom * 6,
              startTime: now,
            });
          }
        }
      }
      prevDownRef.current = currentDown;

      // ── Scanline overlay (very subtle CRT feel) ────────────
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.beginPath();
      for (let y = 0; y < ch; y += 3) {
        ctx.rect(0, y, cw, 1);
      }
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- selectedNodeId accessed via ref to avoid restarting the render loop

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        cursor: 'crosshair',
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(0,0,0,0.92)',
            border: '1px solid rgba(0,255,65,0.3)',
            padding: '4px 8px',
            fontFamily: 'var(--font-terminal, "Share Tech Mono", monospace)',
            fontSize: 11,
            color: '#00FF41',
            pointerEvents: 'none',
            zIndex: 20,
            whiteSpace: 'nowrap',
            textShadow: '0 0 5px rgba(0,255,65,0.3)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
